const express = require('express');
const { Book } = require('../models/Book');
const { upload } = require('../middleWare/multer');
const { optimizeImage } = require('../middleWare/sharp');
const jwt = require('jsonwebtoken');

async function getBooks(req, res) {
    const books = await Book.find();
    console.log(books);
    books.forEach((book) => {
        book.imageUrl = ImagePath(book.imageUrl);
    });
    res.send(books);
}

async function addBook(req, res) {
    const stringifiedBook = JSON.parse(req.body.book);
    const filename = req.file.filename;
    stringifiedBook.imageUrl = `opt_${filename}`;
    try {
        const result = await Book.create(stringifiedBook);
        res.send({ message: 'Book added' });
    } catch (err) {
        console.log(err);
        return res.status(500).send('Error creating book');
    }
}

async function getBookById(req, res) {
    const id = req.params.id;
    try {
        const book = await Book.findById(id);
        console.log(book);
        if (book == null) {
            return res.status(404).send('Book not found');
        }
        book.imageUrl = ImagePath(book.imageUrl);
        res.send(book);
    } catch (err) {
        console.log(err);
        return res.status(500).send('Error getting book');
    }
}

async function deleteBookById(req, res) {
    const id = req.params.id;
    console.log(id);
    try {
        const bookDb = await Book.findById(id);
        if (bookDb == null) {
            return res.status(404).send('Book not found');
        }
        const userIdDb = bookDb.userId;
        const userId = req.payload.userId;
        if (userIdDb != userId) {
            return res.status(403).send('Unauthorized');
        }
        await Book.findByIdAndDelete(id);
        res.send('Book deleted');
    } catch (err) {
        console.log(err);
        return res.status(500).send('Error deleting book');
    }
}

async function putBook(req, res) {
    const book = req.body;
    const id = req.params.id;

    try {
        const bookDb = await Book.findById(id);
        if (bookDb == null) {
            return res.status(404).send('Book not found');
        }
        const userIdDb = bookDb.userId;
        const userIdTok = req.payload.userId;
        if (userIdDb != userIdTok) {
            return res.status(403).send('Unauthorized');
        }

        const modifiedBook = {};
        if (book.title) modifiedBook.title = book.title;
        if (book.author) modifiedBook.author = book.author;
        if (book.year) modifiedBook.year = book.year;
        if (book.genre) modifiedBook.genre = book.genre;
        if (req.file != null) modifiedBook.imageUrl = `opt_${req.file.filename}`;

        await Book.findByIdAndUpdate(id, modifiedBook);
        res.send('Book updated');
    } catch (err) {
        console.log(err);
        return res.status(500).send('Error updating book');
    }

}

async function getbestrating(req, res) {
    try {
        const booksRatingBest = await Book.find().sort({ ratings: -1 }).limit(3);
        booksRatingBest.forEach((book) => {
            book.imageUrl = ImagePath(book.imageUrl);
        });
        res.send(booksRatingBest);
    } catch (err) {
        console.log(err);
        return res.status(500).send('Error getting book');
    }

}

async function addRating(req, res) {
    const id = req.params.id;
    console.log(req.params);
    if (id == null) {
        return res.status(404).send('Book not found');
    }

    const rating = req.body.rating;
    const userId = req.payload.userId;
    try {
        const book = await Book.findById(id);
        if (book == null) {
            return res.status(404).send('Book not found');
        }
        const ratingDb = book.ratings;
        const previousRating = ratingDb.find((rating) => rating.userId == userId);
        if (previousRating != null) {
            return res.status(403).send('Already rated');
        }
        const newRating = {
            userId,
            grade: rating
        };
        ratingDb.push(newRating);
        book.averageRating = calAveRating(ratingDb);
        await book.save();
        book.imageUrl = ImagePath(book.imageUrl);
        res.status(200).send(book);
    } catch (err) {
        console.log(err);
        return res.status(500).send('Error adding rating');
    }
}

function calAveRating(ratings) {
    const sumRate = ratings.reduce((sum, rating) => sum + rating.grade, 0);
    return sumRate / ratings.length;
}

function CheckToken(req, res, next) {
    const token = req.headers.authorization;
    if (token == null) {
        return res.status(401).send('Unauthorized');
    }
    const TokenSplit = token.split(' ')[1];
    try {
        const payload = jwt.verify(TokenSplit, process.env.JWT_SECRET);
        if (payload == null) {
            return res.status(401).send('Unauthorized');
        }
        req.payload = payload;
        next();
    } catch (err) {
        console.log(err);
        return res.status(401).send('Unauthorized');
    }
}

function ImagePath(filename) {
    return `https://monvieuxgrimoireback.onrender.com/images/${filename}`;
}



const Booksrouter = express.Router();
Booksrouter.get('/bestrating', getbestrating);
Booksrouter.get('/:id', getBookById);
Booksrouter.get('/', getBooks);
Booksrouter.post('/', CheckToken, upload.single("image"), optimizeImage, addBook);
Booksrouter.delete('/:id', CheckToken, deleteBookById);
Booksrouter.put('/:id', CheckToken, upload.single("image"), optimizeImage, putBook);
Booksrouter.post('/:id/rating', CheckToken, addRating)

module.exports = { Booksrouter };