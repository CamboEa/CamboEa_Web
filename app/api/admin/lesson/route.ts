import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { requireAdmin } from '@/lib/admin-auth';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';

const BUCKET = 'lessons';
const META_PREFIX = 'metadata';

export type LessonItem = {
  id: string;
  title: string;
  description: string;
  reference: string;
  lessonUrl: string;
  createdAt: string;
};

async function ensureBucket() {
  const supabase = getSupabaseAdminClient();
  const { data: existing } = await supabase.storage.getBucket(BUCKET);
  if (existing?.id) return;

  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 2 * 1024 * 1024,
  });
  if (error) {
    throw new Error(error.message || 'បង្កើត Lessons storage bucket មិនបាន');
  }
}

async function listLessons(): Promise<LessonItem[]> {
  await ensureBucket();
  const supabase = getSupabaseAdminClient();
  const { data: files, error } = await supabase.storage
    .from(BUCKET)
    .list(META_PREFIX, { limit: 500, sortBy: { column: 'name', order: 'desc' } });

  if (error) {
    throw new Error(error.message || 'មិនអាចទាញបញ្ជី Lesson បាន');
  }

  const items: LessonItem[] = [];
  for (const file of files ?? []) {
    if (!file.name.endsWith('.json')) continue;
    const metaPath = `${META_PREFIX}/${file.name}`;
    const { data: blob, error: downloadError } = await supabase.storage.from(BUCKET).download(metaPath);
    if (downloadError || !blob) continue;
    const text = await blob.text().catch(() => '');
    if (!text) continue;

    const parsed = JSON.parse(text) as Partial<LessonItem>;
    if (!parsed.id || !parsed.title || !parsed.lessonUrl) continue;

    items.push({
      id: parsed.id,
      title: String(parsed.title),
      description: String(parsed.description ?? ''),
      reference: String(parsed.reference ?? ''),
      lessonUrl: String(parsed.lessonUrl),
      createdAt: String(parsed.createdAt ?? new Date().toISOString()),
    });
  }

  return items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'មិនមានសិទ្ធិចូលប្រើ' }, { status: 401 });
    }

    const items = await listLessons();
    return NextResponse.json(items, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'ផ្ទុកបញ្ជី Lesson មិនបាន';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'មិនមានសិទ្ធិចូលប្រើ' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const title = String(body.title ?? '').trim();
    const description = String(body.description ?? '').trim();
    const reference = String(body.reference ?? '').trim();
    const lessonUrl = String(body.lessonUrl ?? '').trim();

    if (!title) {
      return NextResponse.json({ error: 'ត្រូវការចំណងជើង Lesson' }, { status: 400 });
    }
    if (!lessonUrl || !isValidHttpUrl(lessonUrl)) {
      return NextResponse.json({ error: 'ត្រូវការ URL ត្រឹមត្រូវ (http/https)' }, { status: 400 });
    }

    const item: LessonItem = {
      id: randomUUID(),
      title,
      description,
      reference,
      lessonUrl,
      createdAt: new Date().toISOString(),
    };

    await ensureBucket();
    const supabase = getSupabaseAdminClient();
    const metaPath = `${META_PREFIX}/${item.id}.json`;
    const { error } = await supabase.storage.from(BUCKET).upload(metaPath, JSON.stringify(item), {
      upsert: true,
      contentType: 'application/json',
    });
    if (error) {
      return NextResponse.json({ error: error.message || 'រក្សាទុក Lesson មិនបាន' }, { status: 500 });
    }

    return NextResponse.json(item, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'បន្ថែម Lesson មិនបាន';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'មិនមានសិទ្ធិចូលប្រើ' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const id = String(body.id ?? '').trim();
    const title = String(body.title ?? '').trim();
    const description = String(body.description ?? '').trim();
    const reference = String(body.reference ?? '').trim();
    const lessonUrl = String(body.lessonUrl ?? '').trim();

    if (!id) {
      return NextResponse.json({ error: 'ត្រូវការ id' }, { status: 400 });
    }
    if (!title) {
      return NextResponse.json({ error: 'ត្រូវការចំណងជើង Lesson' }, { status: 400 });
    }
    if (!lessonUrl || !isValidHttpUrl(lessonUrl)) {
      return NextResponse.json({ error: 'ត្រូវការ URL ត្រឹមត្រូវ (http/https)' }, { status: 400 });
    }

    const items = await listLessons();
    const current = items.find((item) => item.id === id);
    if (!current) {
      return NextResponse.json({ error: 'រកមិនឃើញទិន្នន័យ' }, { status: 404 });
    }

    const updated: LessonItem = {
      ...current,
      title,
      description,
      reference,
      lessonUrl,
    };

    const supabase = getSupabaseAdminClient();
    const metaPath = `${META_PREFIX}/${id}.json`;
    const { error } = await supabase.storage.from(BUCKET).upload(metaPath, JSON.stringify(updated), {
      upsert: true,
      contentType: 'application/json',
    });
    if (error) {
      return NextResponse.json({ error: error.message || 'កែប្រែ Lesson មិនបាន' }, { status: 500 });
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'កែប្រែ Lesson មិនបាន';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'មិនមានសិទ្ធិចូលប្រើ' }, { status: 401 });
    }

    const id = String(request.nextUrl.searchParams.get('id') ?? '').trim();
    if (!id) {
      return NextResponse.json({ error: 'ត្រូវការ id' }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.storage.from(BUCKET).remove([`${META_PREFIX}/${id}.json`]);
    if (error) {
      return NextResponse.json({ error: error.message || 'លុប Lesson មិនបាន' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'លុប Lesson មិនបាន';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
