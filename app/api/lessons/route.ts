import { NextResponse } from 'next/server';
import { getSupabaseAnonClient } from '@/lib/supabase-anon';
import type { LessonItem } from '@/app/api/admin/lesson/route';

type LessonRow = {
  id: string;
  title: string;
  description: string;
  reference: string;
  lesson_url: string;
  created_at: string;
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

export async function GET() {
  try {
    const supabase = getSupabaseAnonClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
    }

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
    const message = e instanceof Error ? e.message : 'ផ្ទុក Lessons មិនបាន';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
