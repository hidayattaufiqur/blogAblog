const db = require('../db')
const slugify = require('slugify')
const { marked } = require('marked')
const createDomPurify = require('dompurify')
const { JSDOM } = require('jsdom')

const window = new JSDOM('').window
const DOMPurify = createDomPurify(window)

function toArticle(row) {
  if (!row) return null
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    description: row.description,
    content: row.content,
    sanitizedHtml: row.sanitized_html,
    slug: row.slug,
    createdAt: new Date(row.created_at),
    deletedAt: row.deleted_at ? new Date(row.deleted_at) : null,
  }
}

function computeContent({ title, content }) {
  const slug = title ? slugify(title, { lower: true, strict: true }) : null
  const sanitizedHtml = content ? DOMPurify.sanitize(marked.parse(content)) : null
  return { slug, sanitizedHtml }
}

async function findAll() {
  const { rows } = await db.query('SELECT * FROM articles WHERE deleted_at IS NULL ORDER BY created_at DESC, id DESC')
  return rows.map(toArticle)
}

async function countAll() {
  const { rows } = await db.query('SELECT COUNT(*)::int AS c FROM articles WHERE deleted_at IS NULL')
  return rows[0].c
}

async function findPage(limit, offset) {
  const [list, total] = await Promise.all([
    db.query('SELECT * FROM articles WHERE deleted_at IS NULL ORDER BY created_at DESC, id DESC LIMIT $1 OFFSET $2', [limit, offset]),
    countAll(),
  ])
  return { items: list.rows.map(toArticle), total }
}

async function findById(id) {
  const { rows } = await db.query('SELECT * FROM articles WHERE id = $1 AND deleted_at IS NULL LIMIT 1', [id])
  return toArticle(rows[0])
}

async function findBySlug(slug) {
  const { rows } = await db.query('SELECT * FROM articles WHERE slug = $1 AND deleted_at IS NULL LIMIT 1', [slug])
  return toArticle(rows[0])
}

async function findPrevNextByCreatedAt(createdAt, id) {
  // Previous = immediately older; Next = immediately newer
  const prevQ = db.query(
    `SELECT slug, title
     FROM articles
     WHERE created_at < $1 OR (created_at = $1 AND id < $2)
     ORDER BY created_at DESC, id DESC
     LIMIT 1`,
    [createdAt, id]
  )
  const nextQ = db.query(
    `SELECT slug, title
     FROM articles
     WHERE created_at > $1 OR (created_at = $1 AND id > $2)
     ORDER BY created_at ASC, id ASC
     LIMIT 1`,
    [createdAt, id]
  )
  const [prev, next] = await Promise.all([prevQ, nextQ])
  return { prev: prev.rows[0] || null, next: next.rows[0] || null }
}

async function findPrevNextBySlug(slug) {
  const items = await findAll() // newest -> oldest, stable by id
  const idx = items.findIndex(a => a.slug === slug)
  if (idx === -1) return { prev: null, next: null }
  // Previous = newer (one index before), Next = older (one index after)
  const prev = idx > 0 ? { slug: items[idx - 1].slug, title: items[idx - 1].title } : null
  const next = idx < items.length - 1 ? { slug: items[idx + 1].slug, title: items[idx + 1].title } : null
  return { prev, next }
}

async function create({ title, author = 'Anonymous', description, content, editor }) {
  const { slug, sanitizedHtml } = computeContent({ title, content })
  const params = [title, author || 'Anonymous', description, content, sanitizedHtml, slug]
  const { rows } = await db.query(
    `INSERT INTO articles (title, author, description, content, sanitized_html, slug)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    params
  )
  const created = toArticle(rows[0])
  // Insert version 1 snapshot
  const vParams = [created.id, 1, created.title, created.author, created.description, created.content, created.sanitizedHtml, created.slug, editor || author || 'Anonymous']
  await db.query(
    `INSERT INTO article_versions (article_id, version_no, title, author, description, content, sanitized_html, slug, editor)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    vParams
  )
  return created
}

async function update(id, { title, author, description, content, editor }) {
  // Fetch current, compute new fields
  const current = await findById(id)
  if (!current) return null
  const next = {
    title: title ?? current.title,
    author: author ?? current.author,
    description: description ?? current.description,
    content: content ?? current.content,
  }
  const { slug, sanitizedHtml } = computeContent({ title: next.title, content: next.content })
  const params = [next.title, next.author, next.description, next.content, sanitizedHtml, slug, id]
  const { rows } = await db.query(
    `UPDATE articles SET title=$1, author=$2, description=$3, content=$4, sanitized_html=$5, slug=$6
     WHERE id=$7 RETURNING *`,
    params
  )
  const updated = toArticle(rows[0])
  // Append new version snapshot
  const { rows: vRows } = await db.query('SELECT COALESCE(MAX(version_no),0)+1 AS v FROM article_versions WHERE article_id=$1', [id])
  const ver = vRows[0].v
  const vParams = [updated.id, ver, updated.title, updated.author, updated.description, updated.content, updated.sanitizedHtml, updated.slug, editor || updated.author || 'Anonymous']
  await db.query(
    `INSERT INTO article_versions (article_id, version_no, title, author, description, content, sanitized_html, slug, editor)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    vParams
  )
  return updated
}

async function destroy(id) {
  await db.query('UPDATE articles SET deleted_at = NOW() WHERE id = $1', [id])
}

async function versionsByArticle(id) {
  const { rows } = await db.query(
    `SELECT article_id, version_no, title, author, description, content, sanitized_html, slug, editor, created_at
     FROM article_versions
     WHERE article_id = $1
     ORDER BY version_no DESC`,
    [id]
  )
  return rows
}

module.exports = {
  findAll,
  findPage,
  findById,
  findBySlug,
  findPrevNextByCreatedAt,
  findPrevNextBySlug,
  create,
  update,
  destroy,
  versionsByArticle,
}
