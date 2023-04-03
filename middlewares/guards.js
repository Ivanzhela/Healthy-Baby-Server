const { getOne } = require('../services/recipeService')

exports.isUser = (req, res, next) => {
    if (req.user) {
        next();
    } else {
        res.status(401).json('Unauthenticated!');
    }
};

exports.isGuest = (req, res, next) => {
    if (!req.user) {
        next();
    } else {
        res.status(401).json('Unauthenticated!');
    }
};

exports.isOwner = async (req, res, next) => {

    const recipe = await getOne(req.params.id);
    const isAuthor = recipe.owner._id == req.user?._id;

    if (!isAuthor) {
        res.status(401).json('Unauthenticated!');
    } else {
        req.recipe = recipe;
        next();
    }
};