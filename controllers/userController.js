const router = require('express').Router();
const { parseError } = require('../util/parser');
const { getUser, updatetUser } = require('../services/userService');
const { isUser } = require('../middlewares/guards');

router.get('/:id', async (req, res) => {
    
    try {
        res.status(200).json(await getUser(req.params.id).lean());
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

        await updatetUser(req.user._id, user);
        res.status(200).json([...user.notifications] || []);
    } catch (err) {
        parseError(err, res);
    };
});

module.exports = router;