var express = require('express');
var router = express.Router();
var chartController = require('../Controllers/CartController')

router.post('/products',chartController.getItems );
router.post('/createOrder', chartController.createOrder);
router.post('/createOrderOnlinePayment', chartController.createOnlinePaymentOrder);

module.exports = router;
