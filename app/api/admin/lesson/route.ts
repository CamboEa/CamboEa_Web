import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { requireAdmin } from '@/lib/admin-auth';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';

export type LessonItem = {
  id: string;
  title: string;
  description: string;
  reference: string;
  lessonUrl: string;
  createdAt: string;
};

type LessonRow = {
  id: string;
  title: string;
  description: string;
  reference: string;
  lesson_url: string;
  created_at: string;
  updated_at: string;
};

function mapRow(row: LessonRow): LessonItem {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    reference: row.reference ?? '',
    lessonUrl: row.lesson_url,
    createdAt: row.created_at,
  };
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

    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      return NextResponse.json({ error: error.message || 'ផ្ទុកបញ្ជី Lesson មិនបាន' }, { status: 500 });
    }

    const items = (data ?? []).map((r) => mapRow(r as LessonRow));
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

    const id = randomUUID();
    const now = new Date().toISOString();
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from('lessons')
      .insert({
        id,
        title,
        description,
        reference,
        lesson_url: lessonUrl,
        created_at: now,
        updated_at: now,
      })
      .select('*')
      .maybeSingle();

    if (error) {
      console.error(error);
      return NextResponse.json({ error: error.message || 'រក្សាទុក Lesson មិនបាន' }, { status: 500 });
    }

    return NextResponse.json(mapRow(data as LessonRow), { status: 201 });
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

    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from('lessons')
      .update({
        title,
        description,
        reference,
        lesson_url: lessonUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error) {
      console.error(error);
      return NextResponse.json({ error: error.message || 'កែប្រែ Lesson មិនបាន' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'រកមិនឃើញទិន្នន័យ' }, { status: 404 });
    }

    return NextResponse.json(mapRow(data as LessonRow), { status: 200 });
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
    const { error } = await supabase.from('lessons').delete().eq('id', id);
    if (error) {
      console.error(error);
      return NextResponse.json({ error: error.message || 'លុប Lesson មិនបាន' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'លុប Lesson មិនបាន';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
