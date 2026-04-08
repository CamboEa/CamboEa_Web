-- News ingest: draft publishing, source attribution, deduplication.
-- Run in Supabase SQL Editor or via CLI.

ALTER TABLE news
  ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS source_name text;

COMMENT ON COLUMN news.is_published IS 'When false, article is draft (admin-only via service role; hidden from anon reads with RLS).';
COMMENT ON COLUMN news.source_url IS 'Canonical URL of ingested item; used for dedup and attribution.';
COMMENT ON COLUMN news.source_name IS 'Human label for the feed/source (admin display).';

CREATE UNIQUE INDEX IF NOT EXISTS news_source_url_unique
  ON news (source_url)
  WHERE source_url IS NOT NULL;

-- RLS: anonymous/authenticated clients only see published rows.
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "news_public_select_published" ON news;
CREATE POLICY "news_public_select_published"
  ON news
  FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

-- Service role bypasses RLS (admin API). If you use other roles for admin, add policies as needed.
