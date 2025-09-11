const db = require('../db')

async function create(email) {
  await db.query('INSERT INTO emails (email) VALUES ($1)', [email])
}

module.exports = { create }

