#!/usr/bin/env node
require('dotenv').config()
const db = require('../db')

async function toArticle(row) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    created_at: row.created_at,
  }
}

async function main() {
  const { rows } = await db.query('SELECT id, title, slug, created_at FROM articles ORDER BY created_at DESC, id DESC')
  console.log(`Total articles: ${rows.length}`)
  for (const row of rows) {
    const a = await toArticle(row)
    const prev = await db.query(
      'SELECT id, slug, title, created_at FROM articles WHERE created_at < $1 OR (created_at = $1 AND id < $2) ORDER BY created_at DESC, id DESC LIMIT 1',
      [a.created_at, a.id]
    )
    const next = await db.query(
      'SELECT id, slug, title, created_at FROM articles WHERE created_at > $1 OR (created_at = $1 AND id > $2) ORDER BY created_at ASC, id ASC LIMIT 1',
      [a.created_at, a.id]
    )
    console.log(`- ${a.title} (#${a.id}) (${a.slug}) @ ${a.created_at}`)
    const pv = prev.rows[0]
    const nx = next.rows[0]
    console.log(`    prev: ${pv ? pv.title : 'null'} (#${pv ? pv.id : ''}) | next: ${nx ? nx.title : 'null'} (#${nx ? nx.id : ''})`)
  }
  await db.pool.end()
}

main().catch(err => { console.error(err); process.exit(1) })
