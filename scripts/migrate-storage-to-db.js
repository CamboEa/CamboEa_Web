/**
 * Migrate legacy Supabase Storage metadata JSON into Postgres tables
 * (lessons, ea_bots, trading_indicators) after running:
 *   supabase/migrations/20260408210000_lessons_ea_indicators_db.sql
 *
 * Usage:
 *   npm run migrate-storage-to-db
 *   npm run migrate-storage-to-db -- --dry-run
 *
 * Requires .env or .env.local: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

async function main() {
  const dotenv = await import('dotenv');
  const { createClient } = await import('@supabase/supabase-js');

  dotenv.config({ path: '.env.local' });
  dotenv.config();

  const dryRun = process.argv.includes('--dry-run');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  async function listMetaJsonPaths(bucket, prefix) {
    const { data, error } = await supabase.storage.from(bucket).list(prefix, {
      limit: 500,
      sortBy: { column: 'name', order: 'asc' },
    });
    if (error) {
      console.warn(`[${bucket}] list ${prefix}: ${error.message}`);
      return [];
    }
    return (data ?? [])
      .filter((f) => f.name.endsWith('.json'))
      .map((f) => `${prefix}/${f.name}`);
  }

  async function downloadText(bucket, path) {
    const { data, error } = await supabase.storage.from(bucket).download(path);
    if (error || !data) return { ok: false, error: error?.message || 'no blob' };
    const text = await data.text();
    return { ok: true, text };
  }

  async function storageObjectExists(bucket, filePath) {
    const idx = filePath.lastIndexOf('/');
    const dir = idx >= 0 ? filePath.slice(0, idx) : '';
    const fileName = idx >= 0 ? filePath.slice(idx + 1) : filePath;
    const { data, error } = await supabase.storage.from(bucket).list(dir || '', { limit: 500 });
    if (error) return false;
    return (data ?? []).some((f) => f.name === fileName);
  }

  async function removePath(bucket, path) {
    if (dryRun) {
      console.log(`  [dry-run] would delete storage ${bucket}/${path}`);
      return true;
    }
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) {
      console.warn(`  Could not delete ${bucket}/${path}: ${error.message}`);
      return false;
    }
    return true;
  }

  let stats = { lessons: 0, lessonsSkipped: 0, bots: 0, botsSkipped: 0, indicators: 0, indicatorsSkipped: 0 };

  // --- Lessons (metadata/*.json in bucket "lessons") ---
  const lessonPaths = await listMetaJsonPaths('lessons', 'metadata');
  for (const metaPath of lessonPaths) {
    const dl = await downloadText('lessons', metaPath);
    if (!dl.ok) {
      console.warn(`Skip ${metaPath}: ${dl.error}`);
      stats.lessonsSkipped += 1;
      continue;
    }
    let parsed;
    try {
      parsed = JSON.parse(dl.text);
    } catch {
      console.warn(`Skip ${metaPath}: invalid JSON`);
      stats.lessonsSkipped += 1;
      continue;
    }
    const id = String(parsed.id ?? '').trim();
    const title = String(parsed.title ?? '').trim();
    const lessonUrl = String(parsed.lessonUrl ?? '').trim();
    if (!id || !title || !lessonUrl) {
      console.warn(`Skip ${metaPath}: missing id/title/lessonUrl`);
      stats.lessonsSkipped += 1;
      continue;
    }

    const row = {
      id,
      title,
      description: String(parsed.description ?? ''),
      reference: String(parsed.reference ?? ''),
      lesson_url: lessonUrl,
      created_at: parsed.createdAt ? new Date(parsed.createdAt).toISOString() : new Date().toISOString(),
      updated_at: parsed.createdAt ? new Date(parsed.createdAt).toISOString() : new Date().toISOString(),
    };

    if (dryRun) {
      console.log(`[dry-run] lesson upsert id=${id} title=${title.slice(0, 40)}…`);
      stats.lessons += 1;
      continue;
    }

    const { error: upsertError } = await supabase.from('lessons').upsert(row, { onConflict: 'id' });
    if (upsertError) {
      console.error(`Lesson ${id}: ${upsertError.message}`);
      stats.lessonsSkipped += 1;
      continue;
    }
    stats.lessons += 1;
    await removePath('lessons', metaPath);
  }

  // --- EA bots ---
  const botPaths = await listMetaJsonPaths('ea_bots', 'metadata');
  for (const metaPath of botPaths) {
    const dl = await downloadText('ea_bots', metaPath);
    if (!dl.ok) {
      stats.botsSkipped += 1;
      continue;
    }
    let parsed;
    try {
      parsed = JSON.parse(dl.text);
    } catch {
      stats.botsSkipped += 1;
      continue;
    }
    const id = String(parsed.id ?? '').trim();
    const filePath = String(parsed.filePath ?? '').trim();
    if (!id || !filePath) {
      stats.botsSkipped += 1;
      continue;
    }

    const hasFile = await storageObjectExists('ea_bots', filePath);
    if (!hasFile) {
      console.warn(`EA bot ${id}: uploads file missing at ${filePath}, still upserting metadata row`);
    }

    const botName = String(parsed.botName ?? parsed.name ?? parsed.fileName ?? 'Bot').trim();
    const fileName = String(parsed.fileName ?? parsed.name ?? 'file').trim();

    const row = {
      id,
      bot_name: botName,
      file_name: fileName,
      description: String(parsed.description ?? ''),
      file_path: filePath,
      size: Number(parsed.size ?? 0),
      mime_type: String(parsed.mimeType ?? 'application/octet-stream'),
      created_at: parsed.createdAt ? new Date(parsed.createdAt).toISOString() : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (dryRun) {
      console.log(`[dry-run] ea_bot upsert id=${id} ${botName}`);
      stats.bots += 1;
      continue;
    }

    const { error: upsertError } = await supabase.from('ea_bots').upsert(row, { onConflict: 'id' });
    if (upsertError) {
      console.error(`ea_bot ${id}: ${upsertError.message}`);
      stats.botsSkipped += 1;
      continue;
    }
    stats.bots += 1;
    await removePath('ea_bots', metaPath);
  }

  // --- Trading indicators ---
  const indPaths = await listMetaJsonPaths('trading_indicators', 'metadata');
  for (const metaPath of indPaths) {
    const dl = await downloadText('trading_indicators', metaPath);
    if (!dl.ok) {
      stats.indicatorsSkipped += 1;
      continue;
    }
    let parsed;
    try {
      parsed = JSON.parse(dl.text);
    } catch {
      stats.indicatorsSkipped += 1;
      continue;
    }
    const id = String(parsed.id ?? '').trim();
    const filePath = String(parsed.filePath ?? '').trim();
    if (!id || !filePath) {
      stats.indicatorsSkipped += 1;
      continue;
    }

    const hasFile = await storageObjectExists('trading_indicators', filePath);
    if (!hasFile) {
      console.warn(`Indicator ${id}: uploads file missing at ${filePath}, still upserting metadata row`);
    }

    const indicatorName = String(
      parsed.indicatorName ?? parsed.name ?? parsed.fileName ?? 'Indicator'
    ).trim();
    const fileName = String(parsed.fileName ?? parsed.name ?? 'file').trim();

    const row = {
      id,
      indicator_name: indicatorName,
      file_name: fileName,
      description: String(parsed.description ?? ''),
      file_path: filePath,
      size: Number(parsed.size ?? 0),
      mime_type: String(parsed.mimeType ?? 'application/octet-stream'),
      created_at: parsed.createdAt ? new Date(parsed.createdAt).toISOString() : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (dryRun) {
      console.log(`[dry-run] indicator upsert id=${id} ${indicatorName}`);
      stats.indicators += 1;
      continue;
    }

    const { error: upsertError } = await supabase.from('trading_indicators').upsert(row, { onConflict: 'id' });
    if (upsertError) {
      console.error(`indicator ${id}: ${upsertError.message}`);
      stats.indicatorsSkipped += 1;
      continue;
    }
    stats.indicators += 1;
    await removePath('trading_indicators', metaPath);
  }

  console.log('\nDone.', dryRun ? '(dry-run)' : '', JSON.stringify(stats, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
