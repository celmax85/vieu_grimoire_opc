const express = require('express');
const { User } = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function signUp(req, res) {
    const email = req.body.email;
    const password = req.body.password;

    if (email == null || password == null) {
        return res.status(400).send('Missing parameters');
    }

    try {
        const userInDb = await User.findOne({ email: email });
        if (userInDb != null) {
            return res.status(400).send('User already exists');
        }
        const user = {
            email,
            password: hashmdp(password),
        };
        await User.create(user);
        res.send('User created');
    } catch (err) {
        return res.status(500).send('Error creating user');
    }
}

async function login(req, res) {
    const body = req.body;

    if (body.email == null || body.password == null) {
        return res.status(400).send('Missing parameters');
    }

    try {
        const userInDb = await User.findOne({ email: body.email });
        if (userInDb == null) {
            return res.status(401).send('Invalid email');
        }
        const passwordInDb = userInDb.password;
        if (!isPasswordValid(body.password, passwordInDb)) {
            return res.status(401).send('Invalid password');
        }
        res.send({
            userId: userInDb._id,
            token: GenerateToken(userInDb._id)
        });
    } catch (err) {
        return res.status(500).send('Error logging in');
    }
}

function GenerateToken(IdUser) {
    const payload = {
        userId: IdUser,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    return token;
}

function hashmdp(password) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
}

function isPasswordValid(password, hash) {
    return bcrypt.compareSync(password, hash);
}

const Usersrouter = express.Router();
Usersrouter.post('/signup', signUp);
Usersrouter.post('/login', login);

module.exports = { Usersrouter };