import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { requireAdmin } from '@/lib/admin-auth';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';

const BUCKET = 'trading_indicators';
const UPLOAD_PREFIX = 'uploads';
const META_PREFIX = 'metadata';

type IndicatorItem = {
  id: string;
  indicatorName: string;
  fileName: string;
  description: string;
  filePath: string;
  fileUrl: string;
  size: number;
  mimeType: string;
  createdAt: string;
};

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

async function ensureBucket() {
  const supabase = getSupabaseAdminClient();
  const { data: existing } = await supabase.storage.getBucket(BUCKET);
  if (existing?.id) return;

  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 50 * 1024 * 1024, // 50 MB
  });
  if (error) {
    throw new Error(error.message || 'បង្កើត Indicator storage bucket មិនបាន');
  }
}

async function listIndicators(): Promise<IndicatorItem[]> {
  await ensureBucket();
  const supabase = getSupabaseAdminClient();

  const { data: files, error } = await supabase.storage
    .from(BUCKET)
    .list(META_PREFIX, { limit: 200, sortBy: { column: 'name', order: 'desc' } });

  if (error) {
    throw new Error(error.message || 'មិនអាចទាញបញ្ជី Indicator បាន');
  }

  const items: IndicatorItem[] = [];
  for (const file of files ?? []) {
    if (!file.name.endsWith('.json')) continue;
    const metaPath = `${META_PREFIX}/${file.name}`;
    const { data: blob, error: downloadError } = await supabase.storage.from(BUCKET).download(metaPath);
    if (downloadError || !blob) continue;
    const text = await blob.text().catch(() => '');
    if (!text) continue;
    const parsed = JSON.parse(text) as Partial<IndicatorItem> & { name?: string };
    if (!parsed?.id || !parsed?.filePath) continue;
    items.push({
      id: parsed.id,
      indicatorName: String(
        parsed.indicatorName ?? parsed.name ?? parsed.fileName ?? 'Indicator គ្មានចំណងជើង'
      ),
      fileName: String(parsed.fileName ?? parsed.name ?? 'ឯកសារមិនស្គាល់'),
      description: String(parsed.description ?? ''),
      filePath: parsed.filePath,
      fileUrl: String(parsed.fileUrl ?? ''),
      size: Number(parsed.size ?? 0),
      mimeType: String(parsed.mimeType ?? 'application/octet-stream'),
      createdAt: String(parsed.createdAt ?? new Date().toISOString()),
    });
  }

  return items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

// GET /api/admin/indicator — list uploaded indicator files (admin only)
export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'មិនមានសិទ្ធិចូលប្រើ' }, { status: 401 });
    }

    const items = await listIndicators();
    return NextResponse.json(items, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'ផ្ទុកបញ្ជី Indicator មិនបាន';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/admin/indicator — upload indicator name + file + description (admin only)
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'មិនមានសិទ្ធិចូលប្រើ' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const indicatorName = String(formData.get('indicatorName') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim();

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'ត្រូវការឯកសារ' }, { status: 400 });
    }
    if (!indicatorName) {
      return NextResponse.json({ error: 'ត្រូវការឈ្មោះ Indicator' }, { status: 400 });
    }

    await ensureBucket();
    const supabase = getSupabaseAdminClient();

    const id = randomUUID();
    const safeFileName = sanitizeFileName(file.name || 'indicator-file');
    const ext = safeFileName.includes('.') ? safeFileName.slice(safeFileName.lastIndexOf('.')) : '';
    const uploadPath = `${UPLOAD_PREFIX}/${id}${ext}`;
    const mimeType = file.type || 'application/octet-stream';
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(uploadPath, buffer, { upsert: false, contentType: mimeType });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message || 'អាប់ឡូដឯកសារមិនបាន' }, { status: 500 });
    }

    const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(uploadPath);

    const item: IndicatorItem = {
      id,
      indicatorName,
      fileName: safeFileName,
      description,
      filePath: uploadPath,
      fileUrl: publicData.publicUrl,
      size: file.size,
      mimeType,
      createdAt: new Date().toISOString(),
    };

    const metaPath = `${META_PREFIX}/${id}.json`;
    const { error: metaError } = await supabase.storage.from(BUCKET).upload(metaPath, JSON.stringify(item), {
      upsert: true,
      contentType: 'application/json',
    });

    if (metaError) {
      await supabase.storage.from(BUCKET).remove([uploadPath]);
      return NextResponse.json({ error: metaError.message || 'រក្សាទុកទិន្នន័យមេតា​មិនបាន' }, { status: 500 });
    }

    return NextResponse.json(item, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'អាប់ឡូដ Indicator មិនបាន';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT /api/admin/indicator — update indicator metadata (admin only)
export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'មិនមានសិទ្ធិចូលប្រើ' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const id = String(body.id ?? '').trim();
    const indicatorName = String(body.indicatorName ?? '').trim();
    const description = body.description != null ? String(body.description).trim() : undefined;

    if (!id) {
      return NextResponse.json({ error: 'ត្រូវការ id' }, { status: 400 });
    }
    if (!indicatorName) {
      return NextResponse.json({ error: 'ត្រូវការឈ្មោះ Indicator' }, { status: 400 });
    }

    const items = await listIndicators();
    const current = items.find((item) => item.id === id);
    if (!current) {
      return NextResponse.json({ error: 'រកមិនឃើញទិន្នន័យ' }, { status: 404 });
    }

    const updated: IndicatorItem = {
      ...current,
      indicatorName,
      description: description ?? current.description ?? '',
    };

    const supabase = getSupabaseAdminClient();
    const metaPath = `${META_PREFIX}/${id}.json`;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(metaPath, JSON.stringify(updated), { upsert: true, contentType: 'application/json' });

    if (error) {
      return NextResponse.json({ error: error.message || 'កែប្រែទិន្នន័យមិនបាន' }, { status: 500 });
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'កែប្រែ Indicator មិនបាន';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/admin/indicator?id=<id> — delete indicator file + metadata (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'មិនមានសិទ្ធិចូលប្រើ' }, { status: 401 });
    }

    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ត្រូវការ id' }, { status: 400 });
    }

    const items = await listIndicators();
    const target = items.find((item) => item.id === id);
    if (!target) {
      return NextResponse.json({ error: 'រកមិនឃើញទិន្នន័យ' }, { status: 404 });
    }

    const supabase = getSupabaseAdminClient();
    const { error } = await supabase
      .storage
      .from(BUCKET)
      .remove([target.filePath, `${META_PREFIX}/${id}.json`]);

    if (error) {
      return NextResponse.json({ error: error.message || 'លុបទិន្នន័យមិនបាន' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'លុប Indicator មិនបាន';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
