var express = require('express');
var router = express.Router();
var recommendationController = require('../Controllers/RecommednationController.js')

/* GET users listing. */
router.get('/latestProducts', recommendationController.getLatestProducts);
router.get('/:userId', recommendationController.recommend );

module.exports = router;
