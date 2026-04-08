import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { requireAdmin } from '@/lib/admin-auth';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';

const BUCKET = 'ea_bots';
const UPLOAD_PREFIX = 'uploads';

type EaBotItem = {
  id: string;
  botName: string;
  fileName: string;
  description: string;
  filePath: string;
  fileUrl: string;
  size: number;
  mimeType: string;
  createdAt: string;
};

type EaBotRow = {
  id: string;
  bot_name: string;
  file_name: string;
  description: string;
  file_path: string;
  size: number;
  mime_type: string;
  created_at: string;
  updated_at: string;
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
    fileSizeLimit: 50 * 1024 * 1024,
  });
  if (error) {
    throw new Error(error.message || 'បង្កើត EA Bot storage bucket មិនបាន');
  }
}

function mapRowToItem(supabase: ReturnType<typeof getSupabaseAdminClient>, row: EaBotRow): EaBotItem {
  const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(row.file_path);
  return {
    id: row.id,
    botName: row.bot_name,
    fileName: row.file_name,
    description: row.description ?? '',
    filePath: row.file_path,
    fileUrl: publicData.publicUrl,
    size: Number(row.size ?? 0),
    mimeType: row.mime_type ?? 'application/octet-stream',
    createdAt: row.created_at,
  };
}

async function listEaBots(): Promise<EaBotItem[]> {
  await ensureBucket();
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('ea_bots')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message || 'មិនអាចទាញបញ្ជី EA Bot បាន');
  }

  return (data ?? []).map((r) => mapRowToItem(supabase, r as EaBotRow));
}

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'មិនមានសិទ្ធិចូលប្រើ' }, { status: 401 });
    }

    const items = await listEaBots();
    return NextResponse.json(items, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'ផ្ទុកបញ្ជី EA Bot មិនបាន';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'មិនមានសិទ្ធិចូលប្រើ' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const botName = String(formData.get('botName') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim();

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'ត្រូវការឯកសារ' }, { status: 400 });
    }
    if (!botName) {
      return NextResponse.json({ error: 'ត្រូវការឈ្មោះ Bot' }, { status: 400 });
    }

    await ensureBucket();
    const supabase = getSupabaseAdminClient();

    const id = randomUUID();
    const safeFileName = sanitizeFileName(file.name || 'bot-file');
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

    const now = new Date().toISOString();
    const { data, error: insertError } = await supabase
      .from('ea_bots')
      .insert({
        id,
        bot_name: botName,
        file_name: safeFileName,
        description,
        file_path: uploadPath,
        size: file.size,
        mime_type: mimeType,
        created_at: now,
        updated_at: now,
      })
      .select('*')
      .maybeSingle();

    if (insertError || !data) {
      await supabase.storage.from(BUCKET).remove([uploadPath]);
      return NextResponse.json(
        { error: insertError?.message || 'រក្សាទុកទិន្នន័យមិនបាន' },
        { status: 500 }
      );
    }

    return NextResponse.json(mapRowToItem(supabase, data as EaBotRow), { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'អាប់ឡូដ EA Bot មិនបាន';
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
    const botName = String(body.botName ?? '').trim();
    const description = body.description != null ? String(body.description).trim() : undefined;

    if (!id) {
      return NextResponse.json({ error: 'ត្រូវការ id' }, { status: 400 });
    }
    if (!botName) {
      return NextResponse.json({ error: 'ត្រូវការឈ្មោះ Bot' }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    const { data: current, error: fetchError } = await supabase
      .from('ea_bots')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !current) {
      return NextResponse.json({ error: 'រកមិនឃើញទិន្នន័យ' }, { status: 404 });
    }

    const { data, error } = await supabase
      .from('ea_bots')
      .update({
        bot_name: botName,
        description: description ?? (current as EaBotRow).description ?? '',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ error: error?.message || 'កែប្រែទិន្នន័យមិនបាន' }, { status: 500 });
    }

    return NextResponse.json(mapRowToItem(supabase, data as EaBotRow), { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'កែប្រែ EA Bot មិនបាន';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

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

    const supabase = getSupabaseAdminClient();
    const { data: target, error: fetchError } = await supabase
      .from('ea_bots')
      .select('file_path')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !target) {
      return NextResponse.json({ error: 'រកមិនឃើញទិន្នន័យ' }, { status: 404 });
    }

    const filePath = (target as { file_path: string }).file_path;

    const { error: deleteError } = await supabase.from('ea_bots').delete().eq('id', id);
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message || 'លុបទិន្នន័យមិនបាន' }, { status: 500 });
    }

    const { error: storageError } = await supabase.storage.from(BUCKET).remove([filePath]);
    if (storageError) {
      console.error('ea_bots storage cleanup failed after DB delete:', storageError.message);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'លុប EA Bot មិនបាន';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
