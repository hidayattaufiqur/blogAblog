const cool = require('cool-ascii-faces')
const express = require('express')
const mongoose = require('mongoose')
const Article = require('./models/article')
const Form = require('./models/mail')
const articleRouter = require('./routes/articles')
const methodOverride = require('method-override')
const bodyParser = require('body-parser')
const app = express()

mongoose.connect('URI'), 
{ useNewUrlParser: true, useUnifiedTopology: true , useCreateIndex: true } )

app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({ extended: false}))
app.use(express.urlencoded({ extended: false }))
app.use(methodOverride('_method'))
app.use('/public', express.static('public'));
app.get('/cool', (req, res) => res.send(cool()))

app.get('/', async (req, res) => {
    res.render('index')
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

app.get('/articles/blog', async (req, res) => {
    const articles = await Article.find().sort({createdAt: 'descending'})
    res.render('articles/blog', { articles: articles })
})

app.use('/articles', articleRouter)
app.use('/mail', Form)

app.listen(process.env.PORT || 3000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });

app.listen(5000)
