const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

const blacklist = new Set();

async function register(username, email, password, profilePic, res) {
    const user = await User.findOne({ username }).collation({ locale: 'en', strength: 2 });

    if (user) {
        res.status(403);
        throw new Error('This username alredy exist!', { cause: 'username' });
    };

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
        username,
        email,
        profilePic,
        password: hashedPassword
    });

    return createSession(newUser);
};

async function login(username, password, res) {
    const user = await User.findOne({ username }).collation({ locale: 'en', strength: 2 });

    if (!user) {
        res.status(403);
        throw new Error('Cannot find username or password', { cause: 'username' });
    };

    const isValidPass = await bcrypt.compare(password, user.password);

    if (!isValidPass) {
        res.status(403);
        throw new Error('Cannot find username or password', { cause: 'password' });
    };

    return createSession(user);
};

function logout(token) {
    blacklist.add(token);
}

function createSession({ _id, username, email, profilePic }) {
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
        profilePic,
        token
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