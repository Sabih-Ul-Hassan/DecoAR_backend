var express = require('express');
var router = express.Router();
var paymentController = require("../Controllers/paymentController")
router.get('/unpaid', paymentController.getAllUnpaidRequests);
router.post('/payment', paymentController.addPaymentRequest);
router.get('/markpaid/:id/:amount', paymentController.markPaid);



module.exports = router;
