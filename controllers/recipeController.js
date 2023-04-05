const mongoose = require('mongoose');
const router = require('express').Router();
const { isUser, isOwner } = require('../middlewares/guards');
const { create, getAll, getOne, update, deleteOne } = require('../services/recipeService');
const { getUser, updatetUser } = require('../services/userService');
const { parseError } = require('../util/parser');

router.get('/', async (req, res) => {
    
    let options = {};
    if (req.query.user != "undefined") {
        let filterRecipes = req.query.saves == 'true' ? 'saves' : 'owner';

        if (req.query.search !== "undefined" && req.query.search !== "") {
            options = { [filterRecipes]: req.query.user, $text: { $search: `${req.query.search}` } }
        } else {
            options = { [filterRecipes]: req.query.user }
        }
    } else {
        if (req.query.search !== "undefined" && req.query.search !== "") {
            options = { $text: { $search: `${req.query.search}` } }
        }
    }

    try {
        res.status(200).json(await getAll(options));
    } catch (err) {
        parseError(err, res);
    };
});

router.post('/', isUser, async (req, res) => {

    try {

        const result = await create({ ...req.body, owner: req.user._id });
        const user = await getUser(req.user._id);
        user.createdRecipes.push(result._id);

        await user.save();
        res.status(200).json(result);
    } catch (err) {
        parseError(err, res);
    };
});

router.get('/:id', async (req, res) => {

    try {
        res.status(200).json(await getOne(req.params.id).lean());
    } catch (err) {
        parseError(err, res);
    };
});

router.put('/:id', isUser, isOwner, async (req, res) => {

    try {
        const result = await update(req.params.id, req.body);
        res.json(result);
    } catch (err) {
        parseError(err, res);
    };
});

router.delete('/:id', isUser, isOwner, async (req, res) => {

    try {
        res.status(200).json(await deleteOne(req.params.id));
    } catch (err) {
        parseError(err, res);
    };
});

router.get('/:id/stars', isUser, async (req, res) => {
    try {
        const recipe = await getOne(req.params.id);
        const owner = await getUser(recipe.owner._id);

        if (owner._id !== req.user._id) {
            owner.notifications.push({ recipe: recipe._id, action: 'rate', username: req.user.username, status: 'unseen' });
            recipe.stars.push(req.user._id);

            await owner.save();
            await recipe.save();
            res.json(recipe);
        }

    } catch (err) {
        parseError(err, res);
    };
});

router.get('/:id/saves', isUser, async (req, res) => {
    try {
        const user = await getUser(req.user._id);
        const recipe = await getOne(req.params.id);
        const owner = await getUser(recipe.owner._id);
        if (owner._id !== req.user._id) {

            user.savedRecipes.push(req.params.id);
            recipe.saves.push(req.user._id);
            owner.notifications.push({ recipe: recipe._id, action: 'save', username: req.user.username, status: 'unseen' });

            await user.save();
            await recipe.save();
            await owner.save();

            res.json(recipe);
        }

    } catch (err) {
        parseError(err, res);
    };
});

router.put('/:id/saves', isUser, async (req, res) => {
    try {
        const user = await getUser(req.user._id);
        const recipe = await getOne(req.params.id);
        if (recipe.owner._id !== req.user._id) {
            
            const userSaveIndex = user.savedRecipes.indexOf(a => a._id == req.params.id);
            user.savedRecipes.splice(userSaveIndex, 1);

            const savesIndex = recipe.saves.indexOf(a => a == req.user._id);
            recipe.saves.splice(savesIndex, 1);

            await user.save();
            await recipe.save();

            res.json(recipe);
        }

    } catch (err) {
        parseError(err, res);
    };
});

router.post('/:id/comments', isUser, async (req, res) => {

    try {

        const recipe = await getOne(req.params.id);
        const owner = await getUser(recipe.owner._id);

        if (owner._id != req.user._id) {
            owner.notifications.push({ recipe: recipe._id, action: 'comment', username: req.user.username, status: 'unseen' });
            await owner.save();
        }

        const username = req.user.username;
        const comment = req.body.comment;
        const commentId = new mongoose.Types.ObjectId();

        recipe.comments.push({ _id: commentId, username, userId: req.user._id, comment });
        await recipe.save();
        res.json(recipe);

    } catch (err) {
        parseError(err, res);
    };
});

router.put('/:id/comments', isUser, async (req, res) => {

    try {

        const recipe = await getOne(req.params.id);
        const index = recipe.comments.findIndex((i) => i._id == req.body.comment._id);
        const { _id, username, userId } = req.body.comment;
        const updateComment = {
            _id,
            username,
            userId,
            comment: req.body.formValues.comment
        }
        recipe.comments.splice(index, 1, updateComment);

        await recipe.save();
        res.json(recipe);

    } catch (err) {
        parseError(err, res);
    };
});

router.delete('/:id/comments', isUser, async (req, res) => {

    try {

        const recipe = await getOne(req.params.id);
        const index = recipe.comments.findIndex((i) => i._id == req.body.comment._id);
        recipe.comments.splice(index, 1);

        await recipe.save();
        res.json(recipe);

    } catch (err) {
        parseError(err, res);
    };
});

module.exports = router;