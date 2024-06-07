var express = require('express');
var router = express.Router();
const multer = require('multer');
const path = require('path');
const authController = require('../Controllers/AuthController');
const uuid = require('uuid');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/uploads');
    },
    filename: function (req, file, cb) {
      const uniqueName = uuid.v4();
      const extension = file.originalname.split('.').pop();
      const filename = `${uniqueName}.${extension}`;
      req.picture = filename;
      cb(null, filename);
    },
  });
  
  const upload = multer({ storage: storage });
  
  router.post('/updateProfilePicture', upload.single('picture'), authController.updateProfilePicture);
  
router.put('/updateAddress/:userId', authController.updateAddress);
router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.post('/logout', authController.logout);
router.get('/user/:email', authController.getUser);
router.get('/payments/:userId', authController.payment);
module.exports = router;
