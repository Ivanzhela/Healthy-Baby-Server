const router = require('express').Router();
const authControllers = require('./controllers/authController');
const userControllers = require('./controllers/userController');
const recipeControllers = require('./controllers/recipeController');

router.use('/', authControllers);
router.use('/user', userControllers);
router.use('/recipe', recipeControllers);


module.exports = router;