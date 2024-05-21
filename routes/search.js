var express = require('express');
var router = express.Router();
var searchController = require('../Controllers/SearchController')
/* GET home page. */
router.get('/products/suggestions/:query',searchController.productSuggestions);
router.get('/filter',searchController.filter);
router.get('/products',searchController.searchProducts);
router.get('/users/:userName',searchController.searchUsers);
module.exports = router;
