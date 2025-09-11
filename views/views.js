const express = require('express')
const app = express()
const Articles = require('../data/articles')
const Emails = require('../data/emails')

app.get('/', async (req, res) => {
    res.render('index')
})

app.get('/articles/blog', async (req, res) => {
    const articles = await Articles.findAll()
    res.render('articles/blog', { articles: articles })
})

app.get('/aboutUs', async (req, res) => {
    res.render('aboutUs')
})

app.post('/newMail', async (req, res, next) => {
    try {
        await Emails.create(req.body.email)
        res.redirect('/aboutUs')
    } catch (err) {
        next(err)
    }
})

module.exports = app
