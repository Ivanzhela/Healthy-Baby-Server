const router = require('express').Router();
const bcrypt = require('bcrypt');
const { parseError } = require('../util/parser');
const { getUser, updateUser } = require('../services/userService');
const { isUser } = require('../middlewares/guards');

router.get('/:id', async (req, res) => {

    try {
        const user = await getUser(req.params.id).lean();
        res.status(200).json({ ...user, password: "" });
    } catch (err) {
        parseError(err, res);
    };
});

router.put('/:id', isUser, async (req, res) => {

    const { username, email, password, rePass, profilePic } = req.body;

    try {
        if (username == '' || password == '' || email == '') {
            res.status(403);
            throw new Error('All fields are required', { cause: 'username' });
        };
        if (password != rePass) {
            res.status(403);
            throw new Error('Passwords don`t match', { cause: 'password' });
        };

        const hashedPassword = await bcrypt.hash(password, 10);
        const oldValue = await getUser(req.params.id).lean();

        const newValue = {
            username,
            email,
            password: hashedPassword,
            profilePic
        };

        res.status(201).json(await updateUser(req.params.id, { ...oldValue, ...newValue }));
    } catch (err) {
        parseError(err, res);
    };
});

router.get('/:id/notifications', isUser, async (req, res) => {

    try {
        const user = await getUser(req.user._id);
        const seenNotifications = user.notifications.filter(a => a.status == 'unseen');
        const startIndex = seenNotifications.length > 10 ? seenNotifications.length : 10;
        user.notifications.reverse().splice(startIndex);

        await user.save()
        res.status(200).json(user.notifications || []);

    } catch (err) {
        parseError(err, res);
    };
});

router.get('/:id/notifications/seen', isUser, async (req, res) => {

    try {
        let user = await getUser(req.user._id);
        user.notifications.map(a => a.status = "seen");

        await updateUser(req.user._id, user);
        res.status(200).json([...user.notifications] || []);
    } catch (err) {
        parseError(err, res);
    };
});

module.exports = router;