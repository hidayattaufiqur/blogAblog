const { Pool } = require('pg')

// Prefer a full DATABASE_URL, otherwise build from components
let connectionString = process.env.DATABASE_URL
if (!connectionString && process.env.DB_USER && process.env.DB_HOST && process.env.DB_NAME) {
  const user = encodeURIComponent(process.env.DB_USER)
  const pass = process.env.DB_PASSWORD ? ':' + encodeURIComponent(process.env.DB_PASSWORD) : ''
  const host = process.env.DB_HOST
  const port = process.env.DB_PORT || 5432
  const db = process.env.DB_NAME
  connectionString = `postgresql://${user}${pass}@${host}:${port}/${db}`
}

const pool = new Pool({ connectionString })

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
  ensureAppSchema: async () => {
    // Ensure soft-delete column exists
    const col = await pool.query(
      `SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'deleted_at'`
    )
    if (col.rowCount === 0) {
      await pool.query(`ALTER TABLE articles ADD COLUMN deleted_at TIMESTAMPTZ`)
    }

    // Ensure versions table exists
    const tbl = await pool.query(`SELECT to_regclass('public.article_versions') as t`)
    if (!tbl.rows[0] || !tbl.rows[0].t) {
      await pool.query(`
        CREATE TABLE article_versions (
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
        )
      `)
    }
  }
}
