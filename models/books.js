const mongoose = require('mongoose')

const booksSchema = new mongoose.Schema({
    bookno:{
        type: String,
        required: true
    },
    author:{
        type: String,
        required: true
    },
    title:{
        type: String,
        required: true
    },
    reviews:[{
        type: mongoose.Schema.Types.Mixed,
        default : {}
    }]
}) 

module.exports = mongoose.model('books', booksSchema)