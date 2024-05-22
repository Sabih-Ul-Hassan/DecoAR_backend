const ProductModel = require('../Models/ProductModel');
const UserModel = require('../Models/UserModel');

var users = async (req,res)=>{
    var users = await UserModel.find({deleted:false}).lean();
    res.json(users);
}
var products = async(req,res)=>{
    var products = await ProductModel.find({}).lean();
    res.json(products.map((x)=>{ return {...x,image:x.images[0]};}));
}
var delUser = async(req,res)=>{
    var user = await UserModel.findById(req.params.userId);
    user.deleted=true;
    await user.save();
    res.json(true);
}
  

module.exports = { users,delUser, products };
