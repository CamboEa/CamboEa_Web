-- News ingest sources managed in DB (admin CRUD).

CREATE TABLE IF NOT EXISTS news_ingest_sources (
  id text PRIMARY KEY,
  label text NOT NULL,
  feed_url text NOT NULL,
  allowed_article_hosts text[] NOT NULL DEFAULT '{}',
  category text NOT NULL CHECK (category IN ('crypto', 'forex')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE news_ingest_sources IS 'Configurable RSS sources for AI news ingest.';
COMMENT ON COLUMN news_ingest_sources.allowed_article_hosts IS 'Allowed article hostnames (without protocol), e.g. coindesk.com';

CREATE INDEX IF NOT EXISTS news_ingest_sources_is_active_idx
  ON news_ingest_sources (is_active);

-- Keep updated_at fresh.
CREATE OR REPLACE FUNCTION set_news_ingest_sources_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_news_ingest_sources_updated_at ON news_ingest_sources;
CREATE TRIGGER trg_news_ingest_sources_updated_at
BEFORE UPDATE ON news_ingest_sources
FOR EACH ROW
EXECUTE FUNCTION set_news_ingest_sources_updated_at();

-- Seed defaults only if absent.
INSERT INTO news_ingest_sources (id, label, feed_url, allowed_article_hosts, category, is_active)
VALUES
  ('coindesk-rss', 'CoinDesk', 'https://www.coindesk.com/arc/outboundfeeds/rss/', ARRAY['coindesk.com'], 'crypto', true),
  ('investing-forex-rss', 'Investing.com Forex News', 'https://www.investing.com/rss/news_25.rss', ARRAY['investing.com'], 'forex', true)
ON CONFLICT (id) DO NOTHING;
