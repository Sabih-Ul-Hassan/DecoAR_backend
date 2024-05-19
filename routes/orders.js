var express = require('express');
var router = express.Router();
var orderController = require('../Controllers/OrderController')
router.put('/updateStatus', orderController.updateOrderStatus);
router.get('/:userId/:orderType',orderController.getOrders);
router.get('/seller/:userId/:orderType',orderController.getOrdersBySeller);
router.get('/:orderId',orderController.getOrderDetails);
router.put('/:orderId',orderController.updateOrderQuantityAndTotalPrice);
router.delete('/:orderId',orderController.cancelOrder);
module.exports = router;
