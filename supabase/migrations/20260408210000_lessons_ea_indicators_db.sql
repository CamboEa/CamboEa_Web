-- Lessons: full records in Postgres (no storage bucket metadata).
-- EA bots & trading indicators: file remains in Storage; metadata in DB.

CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  reference text NOT NULL DEFAULT '',
  lesson_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS lessons_created_at_idx ON lessons (created_at DESC);

CREATE TABLE IF NOT EXISTS ea_bots (
  id uuid PRIMARY KEY,
  bot_name text NOT NULL,
  file_name text NOT NULL,
  description text NOT NULL DEFAULT '',
  file_path text NOT NULL,
  size bigint NOT NULL DEFAULT 0,
  mime_type text NOT NULL DEFAULT 'application/octet-stream',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ea_bots_created_at_idx ON ea_bots (created_at DESC);

CREATE TABLE IF NOT EXISTS trading_indicators (
  id uuid PRIMARY KEY,
  indicator_name text NOT NULL,
  file_name text NOT NULL,
  description text NOT NULL DEFAULT '',
  file_path text NOT NULL,
  size bigint NOT NULL DEFAULT 0,
  mime_type text NOT NULL DEFAULT 'application/octet-stream',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS trading_indicators_created_at_idx ON trading_indicators (created_at DESC);

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lessons_select_public" ON lessons;
CREATE POLICY "lessons_select_public"
  ON lessons
  FOR SELECT
  TO anon, authenticated
  USING (true);

ALTER TABLE ea_bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_indicators ENABLE ROW LEVEL SECURITY;

-- No anon policies on ea_bots / trading_indicators: only service role (admin API) can access.

COMMENT ON TABLE lessons IS 'Lesson links and copy; public read via RLS.';
COMMENT ON TABLE ea_bots IS 'EA bot metadata; binary at file_path in Storage bucket ea_bots.';
COMMENT ON TABLE trading_indicators IS 'Indicator metadata; binary at file_path in Storage bucket trading_indicators.';

-- After this migration runs, import legacy Storage metadata into Postgres:
--   npm run migrate-storage-to-db -- --dry-run   # preview
--   npm run migrate-storage-to-db                # upsert rows + delete metadata/*.json (uploads/ unchanged)
-- Script: scripts/migrate-storage-to-db.js
