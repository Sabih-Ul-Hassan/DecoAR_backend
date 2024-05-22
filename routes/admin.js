var express = require('express');
var router = express.Router();
const adminController = require('../Controllers/AdminController');

 
router.get('/products', adminController.products);
router.get('/users', adminController.users);

module.exports = router;
