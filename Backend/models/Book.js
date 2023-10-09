const mongoose = require("mongoose");

const Book = mongoose.model("Book", {
    userId: String,
    title: String,
    author: String,
    imageUrl: String,
    year: Number,
    genre: String,
    ratings: [
        {
            userId: String,
            grade: Number
        }
    ],
    averageRating: Number
});

module.exports = { Book };