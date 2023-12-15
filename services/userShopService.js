const User = require('../models/UserShop');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

const blacklist = new Set();

async function register(username, email, password, res) {
    const user = await User.findOne({ email }).collation({ locale: 'en', strength: 2 });

    if (user) {
        res.status(403);
        throw new Error('This email alredy exist!', { cause: 'email' });
    };

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
        username,
        email,
        password: hashedPassword
    });

    return createSession(newUser);
};

async function login(email, password, res) {
    const user = await User.findOne({ email }).collation({ locale: 'en', strength: 2 });

    if (!user) {
        res.status(403);
        throw new Error('Cannot find email or password', { cause: 'email' });
    };

    const isValidPass = await bcrypt.compare(password, user.password);

    if (!isValidPass) {
        res.status(403);
        throw new Error('Cannot find email or password', { cause: 'password' });
    };

    return createSession(user);
};


function logout(token) {
    blacklist.add(token);
}

function createSession({ _id, username, email, favourites }) {
    const payload = {
        _id,
        username,
        email,
    };

    const token = jwt.sign(payload, JWT_SECRET);

    return {
        _id,
        username,
        email,
        token,
        favourites
    };
};

function validateToken(token) {

    if (blacklist.has(token)) {
        // res.status(403);
        throw new Error('Cannot find username or password', { cause: 'name' });
    }
    return jwt.verify(token, JWT_SECRET);
}

module.exports = {
    register,
    login,
    logout,
    createSession,
    validateToken
};