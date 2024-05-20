var express = require('express');
var router = express.Router();
var analyticsController = require("../Controllers/AnalyticsController")
router.get('/filter/:userId',  analyticsController.filterProducts);
router.get('/graph/earnings/:userId/:date', analyticsController.getOrderStats);
router.get('/graph/cancelled/:userId/:date', analyticsController.getNumberOfCancelledOrders);
router.get('/graph/count/:userId/:date', analyticsController.getOrderCount);

module.exports = router;
