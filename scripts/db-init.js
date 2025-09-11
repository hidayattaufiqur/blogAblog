#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
require('dotenv').config()
const db = require('../db')

async function main() {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'db', 'schema.sql'), 'utf8')
  await db.query(sql)
  console.log('Database schema initialized.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

