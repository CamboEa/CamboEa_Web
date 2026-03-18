import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import type { LessonItem } from '@/app/api/admin/lesson/route';

const BUCKET = 'lessons';
const META_PREFIX = 'metadata';

export async function GET() {
  try {
    const supabase = getSupabaseAdminClient();
    const { data: files, error } = await supabase.storage
      .from(BUCKET)
      .list(META_PREFIX, { limit: 500, sortBy: { column: 'name', order: 'desc' } });

    if (error) {
      return NextResponse.json({ error: error.message || 'ផ្ទុកបញ្ជី Lesson មិនបាន' }, { status: 500 });
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

    return NextResponse.json(items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)), { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'ផ្ទុក Lessons មិនបាន';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
