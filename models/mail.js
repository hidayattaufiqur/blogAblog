const mongoose = require('mongoose')

const emailSchema = new mongoose.Schema({
    email: {
        type: String,
        required: false
    }
})

module.exports = mongoose.model('Email', emailSchema)
