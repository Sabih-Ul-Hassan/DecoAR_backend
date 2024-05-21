const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  picture: {
    type: String,
    default:"user.jpg"
  },
  address: {
    type: String,
    default: "x y z address"
  },
  balance: {
    type: Number,
    default: 0
  },
  fcmTokken:{
    type:String,
    required:false,
    default:null
  },
  deleted:{
    type: Boolean, default: false
  },
  password:{
    type:String,
    required:true
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
