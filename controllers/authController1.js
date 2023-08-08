const router = require('express').Router();
const bcrypt = require('bcrypt');
const User = require('../models/User1');
const { parseError } = require('../util/parser');
const { register, login, logout } = require('../services/authService1');
const { isUser, isGuest } = require('../middlewares/guards');
const { googleFetch } = require('./googleController')
router.post('/login', isGuest, async (req, res) => {

    const { email, password } = req.body;

    try {
        if (email == '' || password == '') {
            res.status(403);
            throw new Error('All fields are required', {cause: 'email'});
        };
        const user = await login(email, password, res);
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

router.get('/user/:id', isUser, async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id);
        res.status(201).json(user);

    } catch (err) {
        parseError(err, res);
    }
})

router.post('/user/:id', isUser, async (req, res) => {
    const value = req.body;

    try {
        if (value.username == '' || value.password == '' || value.email == '') {
            res.status(403);
            throw new Error('All fields are required', { cause: 'username' });
        };
        if (value.password != value.rePass) {
            res.status(403);
            throw new Error('Passwords don`t match', { cause: 'password' });
        };

        const oldValue = await User.findById(req.params.id).lean();

        const newValue = value.password ? { password: await bcrypt.hash(value.password, 10)} : value;
        const body = { ...oldValue, ...newValue }
        const result = await User.updateOne({_id: req.params.id,}, {$set: body}, {runValidators: true})
        res.status(201).json(result);
    } catch (err) {
        parseError(err, res);
    };
});

router.get('/user/:userId/destination/:content/:id', isUser, async (req, res) => {
    try {
        const userId = req.params.userId;
        const destinationId = req.params.id;
        const content = req.params.content;
        const currContent = content == 'Favourites' ? 'savedDestinations' : 'createdTrips';
        const user = await User.findById(userId);
        const destination = user[currContent].filter( d => d.id == destinationId);

        res.status(201).json(destination);

    } catch (err) {
        parseError(err, res);
    }
})


router.post('/user/:userId/destination/:content/:id', isUser, async (req, res) => {
    try {
        const userId = req.params.userId;
        const destinationId = req.params.id;
        const content = req.params.content;
        const currContent = content == 'Favourites' ? 'savedDestinations' : 'createdTrips';
        const user = await User.findById(userId);
        const destination = user[currContent].filter( d => d.id == destinationId);
        const action = req.body;

        if(action.deleteTrip) {
            user[currContent] = user[currContent].filter( d => d.id != destinationId);
            await user.save();
        } else if(action.deleteItem) {
            const item = action.deleteItem;
            const indexTrip = user[currContent].findIndex(a => a.id == destinationId);
            const trip = user[currContent].find(a => a.id == destinationId);
            const indexPlace = trip.placesToVisit.findIndex(a => a.place_id == item);
            trip.placesToVisit.splice(indexPlace, 1);
            user[currContent].splice(indexTrip, 1, trip);
            await user.save();
        } else if(action.addItem) {
            const item = action.addItem;
            const index = user[currContent].findIndex(a => a.id == destinationId);
            const trip = user[currContent].find(a => a.id == destinationId);
            trip.placesToVisit.push(item);
            user[currContent].splice(index, 1, trip)
            await user.save();
        } else if(action.saveItem) {
            const item = action.saveItem;
            console.log(user[currContent]);
            user[currContent].push(item);
            console.log(user[currContent]);
            await user.save()
        }

        res.status(201).json(user);

    } catch (err) {
        parseError(err, res);
    }
})
router.get('/logout', isUser, (req, res) => {
    logout(req.user.token);
    res.status(204).end();
});

module.exports = router;