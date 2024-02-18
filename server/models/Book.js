const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types

const bookSchema = new mongoose.Schema({
    bookId: String,
    // title: String,
    // author: String,
    likes: [{ type: ObjectId, ref: "UsrModel" }],
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
