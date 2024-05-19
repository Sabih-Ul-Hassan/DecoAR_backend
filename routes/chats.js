var express = require('express');
var router = express.Router();
var chatController = require('../Controllers/ChatContorller')
router.get('/getAllChats/:userId',chatController.getAllChats);
router.get('/getChat/:requestingUserId/:userId2',chatController.getOrCreateChat);
router.put('/sendMessage/:chatId',chatController.sendMessage);
router.put('/updateLastRead/:chatId/:userId',chatController.sendMessage);

module.exports = router;
