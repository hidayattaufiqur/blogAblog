const express = require('express')
const Article = require('./../models/article')
const router = express.Router()

router.get('/new', (req, res) => {
    res.render('articles/new', { article: new Article })
})  

router.get('/edit/:id', async (req, res) => {
    const article = await Article.findById(req.params.id)
    res.render('articles/edit', { article: article })
})  

router.get('/blog/:slug', async (req, res, next) => {
    const article = await Article.findOne({ slug: req.params.slug })
    Article.findOne({ slug: req.params.slug }).then((Article) => {
        // if(!Article){
        //     return res.status(404).send();
        // }
        if (article == null) res.redirect('/')
        res.render('articles/show', { article: article})
    })
})

router.get('/api/blog/:slug', async (req, res, next) => {
    const article = await Article.findOne({ slug: req.params.slug })
    Article.findOne({ slug: req.params.slug }).then((Article) => {
        // if(!Article){
        //     return res.status(404).send();
        // }
        if (article == null) res.redirect('/')
        res.send(Article)
    })
})

router.post('/blog/', async (req, res, next) => {
    req.article = new Article()
    next()
}, saveArticleAndRedirect('new'))

router.delete('/:id', async (req,res) => {
    await Article.findByIdAndDelete(req.params.id)
    res.redirect('/articles/blog')
})

router.put('/blog/:id', async (req, res, next) => {
    req.article = await Article.findById(req.params.id)
    next()
}, saveArticleAndRedirect('edit'))

function saveArticleAndRedirect(path) {
    return async (req, res) => {
        let article = req.article
        article.title= req.body.title
        article.description= req.body.description
        article.markdown= req.body.markdown
        try {
            article = await article.save()
            res.redirect(`/articles/blog/${article.slug}`)
        } catch (e) {
            res.render(`articles/blog/${path}`, { article: article })
        }
    }
}

module.exports = router