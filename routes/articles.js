const express = require('express')
const Articles = require('../data/articles')
const router = express.Router()

router.get('/new', (req, res) => {
  // Provide an empty article shape for the form
  res.render('articles/new', { article: { title: '', author: '', description: '', content: '' } })
})

router.get('/edit/:id', async (req, res) => {
  const article = await Articles.findById(req.params.id)
  if (!article) return res.redirect('/articles/blog')
  res.render('articles/edit', { article })
})

router.get('/blog/:slug', async (req, res) => {
  const article = await Articles.findBySlug(req.params.slug)
  if (!article) return res.redirect('/')
  const words = (article.content || '').trim().split(/\s+/).filter(Boolean).length
  const readingTime = Math.max(1, Math.ceil(words / 200))
  const { prev, next } = await Articles.findPrevNextBySlug(article.slug)
  res.render('articles/show', { article, readingTime, prevArticle: prev, nextArticle: next })
})

// router.get('/api/blog/:slug', async (req, res, next) => {
//     const article = await Article.findOne({ slug: req.params.slug })
//     Article.findOne({ slug: req.params.slug }).then((Article) => {
//         if (article == null) res.redirect('/')
//         res.send(Article)
//     })
// })

router.post('/blog/', async (req, res) => {
  try {
    const created = await Articles.create({
      title: req.body.title,
      author: req.body.author,
      description: req.body.description,
      content: req.body.content,
      editor: req.body.editor || req.body.author,
    })
    res.redirect(`/articles/blog/${created.slug}`)
  } catch (e) {
    res.render('articles/new', { article: req.body, error: 'Failed to create article' })
  }
})

router.delete('/:id', async (req,res) => {
  await Articles.destroy(req.params.id)
  res.redirect('/articles/blog')
})

router.put('/blog/:id', async (req, res) => {
  try {
    const updated = await Articles.update(req.params.id, {
      title: req.body.title,
      author: req.body.author,
      description: req.body.description,
      content: req.body.content,
      editor: req.body.editor || req.body.author,
    })
    if (!updated) return res.redirect('/articles/blog')
    res.redirect(`/articles/blog/${updated.slug}`)
  } catch (e) {
    const article = await Articles.findById(req.params.id)
    res.render('articles/edit', { article })
  }
})

// Version history view
router.get('/versions/:id', async (req, res) => {
  const article = await Articles.findById(req.params.id)
  if (!article) return res.redirect('/articles/blog')
  const versions = await Articles.versionsByArticle(req.params.id)
  res.render('articles/versions', { article, versions })
})

module.exports = router
