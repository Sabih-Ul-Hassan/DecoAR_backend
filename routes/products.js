var express = require('express');
var router = express.Router();
var {addProduct , getProductsByUserId, getProductById, deleteProductById,updateProduct} = require('../Controllers/ProductController');
const multer = require('multer');
const uuid = require('uuid');


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'images') {
      cb(null, 'public/uploads'); 
    } else if (file.fieldname === 'model') {
      cb(null, 'public/models');  
      cb(new Error('Invalid fieldname'), null);
    }
  },
  filename: function (req, file, cb) {
    const uniqueName = uuid.v4(); // Generate a random UUID
    const extension = file.originalname.split('.').pop();
    const filename = `${uniqueName}.${extension}`;
    
    if (file.fieldname === 'images') {
      req.images = req.images || [];
      req.images.push(filename ); // assuming you want to keep track of image filenames
    } else if (file.fieldname === 'model') {
      req.model = filename;
    }
    
    cb(null, filename);
  },
});

const upload = multer({ storage: storage });

router.post('/add', upload.fields([{ name: 'images' }, { name: 'model' }]), addProduct);
router.get('/inventory/:userId', getProductsByUserId);
router.get('/:id', getProductById);
router.delete('/:id', deleteProductById);
router.put('/:productId', updateProduct);

module.exports = router;
