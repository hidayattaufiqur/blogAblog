const express = require('express')
const methodOverride = require('method-override')
const bodyParser = require('body-parser')
require('dotenv').config()
const articleRouter = require('./routes/articles')
const views = require('./views/views')

const app = express()

app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({ extended: false}))
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: false }))
app.use(methodOverride('_method'))
app.use('/public', express.static('public'));

app.use(views)
app.use('/articles', articleRouter)

const host = process.env.HOST || '127.0.0.1'
const port = process.env.PORT || 4000

async function start() {
  try {
    const db = require('./db')
    if (db.ensureAppSchema) await db.ensureAppSchema()
  } catch (err) {
    console.error('Failed to ensure schema:', err.message)
  }
  app.listen(port, host, function(){
    const addr = this.address()
    console.log('Express server listening on %s:%d in %s mode', addr.address, addr.port, app.settings.env)
  })
}

start()
