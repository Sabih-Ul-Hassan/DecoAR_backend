
var ProductModel = require('../Models/ProductModel')
var UserModel = require('../Models/UserModel')
var OrderModel = require('../Models/OrderModel')
var PaymentModel = require("../Models/PayemntModel");

var {addNotification} = require("../Functions/addNotification")
var {sendNotification} = require('../Functions/sendNotification')
var {getFCMTokenByUserID} = require('../Functions/getFCMTokenByUserID')


var getItems = async (req, res) => {
    try {
      const { ids } = req.body;
      const idArray = typeof ids === 'string' ? [...ids] : ids;
      const products = await ProductModel.find({ _id: { $in: idArray } });
      const productData = products.map(product => ({
        _id: product._id,
        title: product.title,
        availability: product.availability,
        image: product.images.length > 0 ? product.images[0] : null,
      }));
       
      res.json(productData);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
 var createOrder = async (req, res) => {
    try {
      const { userId, cart, shippingAddress } = req.body;
  
      let address = shippingAddress;
      if (!shippingAddress) {
        const user = await UserModel.findById(userId);
        if (!user) {
          return res.status(400).json({ message: 'User not found' });
        }
        address = user.address;
      }
  
      for (const item of cart) {
        const product = await ProductModel.findById(item.productId);
        if (!product || product.availability<item.quantity) {
          return res.status(400).json({ message: 'Product not found' });
        }
        product.availability-=item.quantity;
        
        const totalPrice = product.price * item.quantity;
  
        const order = new OrderModel({
          user: userId,
          seller: product.userId,
          product: item.productId,
          quantity: item.quantity,
          totalPrice: totalPrice,
          shippingAddress: address,
        });
        await order.save();
        await product.save();
        var seller_fcm=await getFCMTokenByUserID(order.seller);
        var notiBody=`New order for Product ${product.title}`;
        await addNotification(notiBody,order.seller,'seller');
        sendNotification(seller_fcm,"Order Updated",notiBody,{type:"notification"})
        if(product.availability<5){
            var notiBody=`Invenotry short for item: ${product.title}, ${product.availability} left.`;
            await addNotification(notiBody,order.seller,'seller');
            sendNotification(seller_fcm,"Order Updated",notiBody,{type:"notification"})
                
        }
       
      }
  
      res.status(201).json({ message: 'Orders created successfully' });
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
 var createOnlinePaymentOrder = async (req, res) => {
    try {
      const { userId, cart, shippingAddress } = req.body;
      var finalSum=0;
      let address = shippingAddress;
      if (!shippingAddress) {
        const user = await UserModel.findById(userId);
        if (!user) {
          return res.status(400).json({ message: 'User not found' });
        }
        address = user.address;
      }
  
      for (const item of cart) {
        const product = await ProductModel.findById(item.productId);
        if (!product || product.availability<item.quantity) {
          return res.status(400).json({ message: 'Product not found' });
        }
        product.availability-=item.quantity;
        
        const totalPrice = product.price * item.quantity;
        finalSum+=totalPrice;
        const order = new OrderModel({
          user: userId,
          seller: product.userId,
          product: item.productId,
          quantity: item.quantity,
          totalPrice: totalPrice,
          shippingAddress: address,
          paymentMethod:"online"
        });
        await order.save();
        await product.save();
        await updateBalance(totalPrice,product.userId);
        var seller_fcm=await getFCMTokenByUserID(order.seller);
        var notiBody=`New order for Product ${product.title}; Payment method was online`;
        await addNotification(notiBody,order.seller,'seller');
        sendNotification(seller_fcm,"Order Updated",notiBody,{type:"notification"})
        if(product.availability<5){
            var notiBody=`Invenotry short for item: ${product.title}, ${product.availability} left.`;
            await addNotification(notiBody,order.seller,'seller');
            sendNotification(seller_fcm,"Order Updated",notiBody,{type:"notification"})
                
        }
       
      }
      var payment = new PaymentModel({amount:finalSum,userId,transactionType:"sending"});
      await payment.save();
      res.status(201).json({ message: 'Orders created successfully' });
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
async function updateBalance(totalPrice, userId) {
  try {
      const user = await UserModel.findById(userId);

      if (!user) {
          throw new Error('User not found');
      }

      if(user.balance)
        user.balance += totalPrice;
      else 
        user.balance = totalPrice;
      await user.save();

  } catch (error) {
      console.error('Error updating balance:', error.message);
  }
}
  module.exports={getItems,createOrder,createOnlinePaymentOrder}