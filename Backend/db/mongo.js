const mongoose = require("mongoose");


const DB_URL = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@${process.env.DB_DOMAIN}`;

console.log(DB_URL);


async function connect() {
    try {
        await mongoose.connect(DB_URL);
        console.log("Database connected");
    } catch (err) {
        console.log("Error connecting to the database", err);
    }
}

connect();
