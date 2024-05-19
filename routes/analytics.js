var express = require('express');
var router = express.Router();
var analyticsController = require("../Controllers/AnalyticsController")
router.get('/filter/:userId',  analyticsController.filterProducts);

module.exports = router;
