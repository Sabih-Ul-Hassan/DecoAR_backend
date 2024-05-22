var ProductModel = require("../Models/ProductModel")
var ReviewModel = require("../Models/ReviewModel")
const uuid = require('uuid');


const deleteProductById = async (req, res) => {
    const { id } = req.params;
    console.log(id);
    try {
      const prod = await ProductModel.findById(id);
      prod.deleted=true;
      await prod.save();
      if (prod.deleted) {
        res.status(200).json({ message: 'Product deleted successfully' });
      } else {
        res.status(404).json({ error: 'Product not found' });
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };


const getProductById = async (req, res) => {
    try {
      const productId = req.params.id;
      const product = await ProductModel.findById(productId).lean();
      const reviews = await ReviewModel.find({ productId: productId });
      var averageRating ;
      if (reviews.length === 0) averageRating= 0;
      else{
        const totalStars = reviews.reduce((sum, review) => sum + review.stars, 0);
        averageRating = totalStars / reviews.length;
      }
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      // setTimeout(() => {
      //   res.status(200).json(product);
      // }, 200);
      res.status(200).json({...product,averageRating,reviews:reviews.length}); 
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  

var addProduct = async  (req,res)=>{
 
    try {
      const {
        title,
        price,
        availability,
        category,
        description,
        shippingInfo,
        shippingPrice,
        tags,
        userId,
        alternativeModelText,
        placement,
        backgroundModelColor,
      } = req.body;
  
      const newProduct = new ProductModel({
        title,
        price,
        availability,
        category,
        description,
        shippingInfo,
        shippingPrice,
        tags: tags.split(','),
        userId,
        alternativeModelText,
        placement,
        backgroundModelColor,
      });
  
    
        
        const savedProduct = await newProduct.save();
    

        savedProduct.images = req.images;
        savedProduct.model = req.model;

    
      
        await savedProduct.save();
        res.status(200).json({ message: 'Product uploaded successfully' });
      } catch (error) {
        console.error('Error uploading product:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }

}


const getProductsByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;

    const products = await ProductModel.find({ userId }, 'images title price category availability _id');

  
    
    const formattedProducts = products.map(product => ({
      'id': product._id.toString(),
      'image': product.images.length > 0 ? product.images[0] : null,
      'title': product.title,
      'price': product.price,
      'category': product.category,
      'availability': product.availability,
    }));
    res.status(200).json(formattedProducts);
    // setTimeout(() => {
    //   res.status(200).json(formattedProducts);
    // }, 300);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

var updateProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const newData = req.body;
    console.log('yo')
    const updatedProduct = await ProductModel.findByIdAndUpdate(
      productId,
      { $set: newData },
      { new: true }
    );

    res.json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = { addProduct, getProductsByUserId, getProductById, deleteProductById , updateProduct};