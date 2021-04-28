const mongoose = require('mongoose')
const marked = require('marked')
const createdDomPurifier = require('dompurify')
const slugify = require('slugify')
const { JSDOM } = require('jsdom')
const dompurify = createdDomPurifier(new JSDOM().window)


const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String
        // default: "Anonymous"
    },
    description: {
        type: String
    }, 
    content: {
        type: String,
        required: true
    }, 
    createdAt: {
        type: Date,
        default: Date.now
    },
    slug: {
        type: String,
        required: true,
        unique: true
    }, 
    sanitizedHtml: {
        type: String,
        required: true
    }
})

articleSchema.pre('validate', function(next) {
    if (this.title) {
        this.slug = slugify(this.title, { lower: true, strict: true })
    }

    if (this.content) {
        this.sanitizedHtml = dompurify.sanitize(marked(this.content))
    }
    
    next()
})


module.exports = mongoose.model('Article', articleSchema)