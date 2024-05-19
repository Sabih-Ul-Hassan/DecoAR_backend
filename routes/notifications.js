var express = require('express');
var router = express.Router();
var notificationController = require('../Controllers/NotificationController')

router.get('/:userId/:type',notificationController.getNotifications);

module.exports = router;
