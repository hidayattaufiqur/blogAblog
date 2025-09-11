-- Articles table
CREATE TABLE IF NOT EXISTS articles (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT 'Anonymous',
  description TEXT,
  content TEXT NOT NULL,
  sanitized_html TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Emails table
CREATE TABLE IF NOT EXISTS emails (
  id SERIAL PRIMARY KEY,
  email TEXT
);

-- Soft delete support
ALTER TABLE articles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Article version history (multi-author friendly)
CREATE TABLE IF NOT EXISTS article_versions (
  id SERIAL PRIMARY KEY,
  article_id INT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  version_no INT NOT NULL,
  title TEXT,
  author TEXT,
  description TEXT,
  content TEXT,
  sanitized_html TEXT,
  slug TEXT,
  editor TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(article_id, version_no)
);
