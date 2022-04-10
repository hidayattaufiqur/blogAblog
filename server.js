const express = require('express')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const bodyParser = require('body-parser')
require("dotenv").config()
const Article = require('./models/article')
const Form = require('./models/mail')
const articleRouter = require('./routes/articles')
const views = require('./views/views')

const app = express()

mongoose.connect(process.env.URI, 
{ useNewUrlParser: true, useUnifiedTopology: true , useCreateIndex: true } )

app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({ extended: false}))
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: false }))
app.use(methodOverride('_method'))
app.use('/public', express.static('public'));

app.use(views)
app.use('/articles', articleRouter)
app.use('/mail', Form)

app.listen(process.env.PORT || 3000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

