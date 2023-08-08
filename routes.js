const router = require('express').Router();
const authControllers = require('./controllers/authController');
const authControllers1 = require('./controllers/authController1');
const userControllers = require('./controllers/userController');
const recipeControllers = require('./controllers/recipeController');
const googleControllers = require('./controllers/googleController.js');

router.use('/', authControllers);
router.use('/google', googleControllers);
router.use('/user', userControllers);
router.use('/recipe', recipeControllers);
router.use('/auth', authControllers1);

module.exports = router;