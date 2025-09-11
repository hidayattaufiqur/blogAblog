#!/usr/bin/env node
require('dotenv').config()
const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

function buildUrlFromParts() {
  if (!(process.env.DB_USER && process.env.DB_HOST && process.env.DB_NAME)) return null
  const user = encodeURIComponent(process.env.DB_USER)
  const pass = process.env.DB_PASSWORD ? ':' + encodeURIComponent(process.env.DB_PASSWORD) : ''
  const host = process.env.DB_HOST
  const port = process.env.DB_PORT || 5432
  const db = process.env.DB_NAME
  return `postgresql://${user}${pass}@${host}:${port}/${db}`
}

async function ensureDatabaseExists() {
  const targetUrl = process.env.DATABASE_URL || buildUrlFromParts()
  if (!targetUrl) throw new Error('DATABASE_URL or DB_* vars must be set')

  // Try connecting to the target DB first
  const tryClient = new Client({ connectionString: targetUrl })
  try {
    await tryClient.connect()
    await tryClient.end()
    return targetUrl // Database exists
  } catch (err) {
    // If database does not exist, error code is 3D000 (invalid_catalog_name)
    if (err.code !== '3D000') throw err
  }

  // Build admin URL by connecting to default 'postgres' DB
  const url = new URL(targetUrl)
  const adminUrl = new URL(targetUrl)
  adminUrl.pathname = '/postgres'

  const adminClient = new Client({ connectionString: adminUrl.toString() })
  await adminClient.connect()
  const dbName = url.pathname.replace(/^\//, '')
  await adminClient.query(`CREATE DATABASE ${JSON.stringify(dbName).slice(1, -1)}`)
  await adminClient.end()
  return targetUrl
}

async function applySchema(url) {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'db', 'schema.sql'), 'utf8')
  const client = new Client({ connectionString: url })
  await client.connect()
  await client.query(sql)
  await client.end()
}

async function main() {
  const url = await ensureDatabaseExists()
  await applySchema(url)
  console.log('Database is ready (created if missing) and schema applied.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

