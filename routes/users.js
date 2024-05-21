var express = require('express');
var router = express.Router();
const authController = require('../Controllers/AuthController');

 
router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.post('/logout', authController.logout);
router.get('/payments/:userId', authController.payment);
module.exports = router;
