const ProductModel = require('../Models/ProductModel');
const UserModel = require('../Models/UserModel');

var users = async (req,res)=>{
    var users = await UserModel.find({}).lean();
    res.json(users);
}
var products = async(req,res)=>{
    var products = await ProductModel.find({}).lean();
    res.json(products.map((x)=>{ return {...x,image:x.images[0]};}));
}
  

module.exports = { users, products };
