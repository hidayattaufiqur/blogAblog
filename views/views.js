const express = require('express')
const app = express()
const Article = require('./../models/article')
const Form = require('./../models/mail')

app.get('/', async (req, res) => {
    res.render('index')
})

app.get('/articles/blog', async (req, res) => {
    const articles = await Article.find().sort({createdAt: 'descending'})
    res.render('articles/blog', { articles: articles })
})

app.get('/aboutUs', async (req, res) => {
    res.render('aboutUs')
})

app.post('/newMail', async (req, res, next) => {
    var form = new Form();
    form.email= req.body.email;
    
    form.save(function(err, form) {
                if (err) return next(err);
                    if (err) return next(err);
                   res.redirect("/aboutUs");
            });
})

module.exports = app