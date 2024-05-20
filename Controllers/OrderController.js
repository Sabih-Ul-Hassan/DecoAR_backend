var OrderModel = require("../Models/OrderModel")
var UserModel = require("../Models/UserModel")
var ProductModel = require("../Models/ProductModel")
var PaymentModel = require("../Models/PayemntModel");
var {addNotification} = require("../Functions/addNotification")
var {sendNotification} = require('../Functions/sendNotification')
var {getFCMTokenByUserID} = require('../Functions/getFCMTokenByUserID')

const getOrders = async (req, res) => {
    let filter = { user: req.params.userId };
  
    if (req.params.orderType.toLowerCase() !== 'all') {
      filter.status = req.params.orderType;
    }
  
    try {
      const orders = await OrderModel.find(filter).sort({ createdAt: -1 }).populate('product seller').exec();
  
      const formattedOrders = orders.map(order => {
        const product = order.product;
        const imageUrl = product.images.length > 0 ? product.images[0] : '';
  
        return {
          orderId: order._id,
          productName: product.title,
          quantity: order.quantity,
          totalPrice: order.totalPrice,
          status: order.status,
          imageUrl: imageUrl,
          paymentMethod:order.paymentMethod
        };
      });
      
      res.json( formattedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  };
  const getOrdersBySeller = async (req, res) => {
    let filter = { seller: req.params.userId };
  
    if (req.params.orderType.toLowerCase() !== 'all') {
      filter.status = req.params.orderType;
    }
  
    try {
      const orders = await OrderModel.find(filter)
                                     .sort({ createdAt: -1 })
                                     .populate('product seller')
                                     .exec();
  
      const formattedOrders = orders.map(order => {
        const product = order.product;
        const imageUrl = product.images.length > 0 ? product.images[0] : '';
  
        return {
          orderId: order._id,
          productName: product.title,
          quantity: order.quantity,
          totalPrice: order.totalPrice,
          status: order.status,
          imageUrl: imageUrl,
        };
      });
  
      res.json(formattedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
};
   
  async function getOrderDetails(req,res) {
    try {
      const order = await OrderModel.findById(req.params.orderId);
   
      const product = await ProductModel.findById(order.product);
      var userName =(await UserModel.findById(order.user))?.name;
      var  sellerName=(await UserModel.findById(order.seller))?.name; 
      res.json( {
        orderId: order._id,
        productName: product.title,
        quantity: order.quantity,
        totalPrice: order.totalPrice,
        status: order.status,
        shippingAddress: order.shippingAddress,
        item: product,
        sellerId:order.seller,
        sellerName,
        userName,
        userId:order.user,
        paymentMethod:order.paymentMethod
      });
    } catch (error) {
      throw new Error('Failed to fetch order details: ' + error.message);
    }
  }
  
 
async function updateOrderQuantityAndTotalPrice(req,res) {
  const orderId = req.params.orderId;
  const newQuantity = req.body.newQuantity;

  try {
    const order = await OrderModel.findById(orderId);

    const product = await ProductModel.findById(order.product);

    const newTotalPrice = product.price * newQuantity;
    order.quantity = newQuantity;
    order.totalPrice = newTotalPrice;
    await order.save();
    var notiBody=`The quantity of your order, with order ID: ${orderId}, has been changed. new Quantity: ${newQuantity}`;
    await addNotification(notiBody,order.seller,'seller');
    sendNotification(await getFCMTokenByUserID(order.seller),"Order Updated",notiBody,{type:"notification"})
    res.json(order);
  } catch (error) {
    console.error('Error updating order quantity and total price:', error);
    throw error;
  }
}

async function updateBalanceAfterCancelingSeller(totalPrice, userId) {
  try {
      const user = await UserModel.findById(userId);

      if (!user) {
          throw new Error('User not found');
      }

      if(user.balance)
        user.balance -= totalPrice;
      else 
        user.balance = -1 * totalPrice;
      await user.save();

  } catch (error) {
      console.error('Error updating balance:', error.message);
  }
}
async function updateBalanceAfterCancelingCustomer(totalPrice, userId) {
  try {
      const user = await UserModel.findById(userId);

      if (!user) {
          throw new Error('User not found');
      }

      if(user.balance)
        user.balance += totalPrice;
      else 
        user.balance =  totalPrice;
      await user.save();

  } catch (error) {
      console.error('Error updating balance:', error.message);
  }
}
const updateOrderStatus = async (req, res) => {
  const { orderId, status } = req.body;

  try {
   
    const order = await OrderModel.findByIdAndUpdate(orderId, { status }, { new: true });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    var notiBody=`The status of order has been updated to ${status}. Order ID: ${orderId}, `;
    await addNotification(notiBody,order.user,'user');
    sendNotification(await getFCMTokenByUserID(order.seller),"Status Updated",notiBody,{type:"notification"})

    res.status(200).json({ message: 'Order status updated successfully', order });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Failed to update order status' });
  }
};


async function cancelOrder(req,res) {
  const orderId = req.params.orderId;
 
  try {
    const order = await OrderModel.findById(orderId);

    order.status = 'Cancelled';
    await order.save();
    if(order.paymentMethod=="online")
{    await updateBalanceAfterCancelingCustomer(order.totalPrice,order.user);
    await updateBalanceAfterCancelingSeller(order.totalPrice,order.seller);
    await recieveAmount(order.totalPrice,order.user);
  }
    var notiBody=`Your order, with order ID: ${orderId}, has been cancelled.`;
    await addNotification(notiBody,order.seller,'seller');
    sendNotification(await getFCMTokenByUserID(order.seller),"Order Updated",notiBody,{type:"notification"})

    res.json(order);
  } catch (error) {
    console.error('Error updating order quantity and total price:', error);
    throw error;
  }
}

var recieveAmount=async(amount,userId)=>{
  var payment = new PaymentModel({amount,userId,transactionType:"receiving"});
  await payment.save();
}
module.exports = {updateOrderStatus, getOrders, getOrderDetails,updateOrderQuantityAndTotalPrice,cancelOrder,getOrdersBySeller};

