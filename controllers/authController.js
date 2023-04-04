const router = require('express').Router();
const { parseError } = require('../util/parser');
const { register, login, logout } = require('../services/authService');
const { isUser, isGuest } = require('../middlewares/guards');

router.post('/login', isGuest, async (req, res) => {

    const { username, password } = req.body;

    try {
        if (username == '' || password == '') {
            res.status(403);
            throw new Error('All fields are required', {cause: 'username'});
        };
        const user = await login(username, password, res);
        res.json(user);
    } catch (error) {
        parseError(error, res);
    };
});

router.post('/register', isGuest, async (req, res) => {
    const { username, email, password, rePass } = req.body;

    try {
        if (username == '' || password == '' || email == '') {
            res.status(403);
            throw new Error('All fields are required', {cause: 'username'});
        };
        if (password != rePass) {
            res.status(403);
            throw new Error('Passwords don`t match', {cause: 'password'});
        };
        
        const user = await register(username, email, password, res);

        res.status(201).json(user);

    } catch (err) {
        parseError(err, res);
    };
});

router.get('/logout', isUser, (req, res) => {
    logout(req.user.token);
    res.status(204).end();
});

module.exports = router;