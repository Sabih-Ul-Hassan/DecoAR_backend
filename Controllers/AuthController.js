
const User = require('../Models/UserModel');
const Payment = require("../Models/PayemntModel")
const mongoose= require("mongoose");

exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (password !== user.password) {
      return res.status(401).json({ message: 'Incorrect password' });
    }
    user.fcmTokken = req.query.fcmTokken;
    console.log(req.query.fcmTokken)
    await user.save();
    return res.status(200).json(user);
  } catch (error) {
    console.error('Error logging in:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
exports.getUser = async (req, res) => {
  
  try {
    const user = await User.findOne({ email: req.params.email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error('Error logging in:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
exports.logout = async (req, res) => {
  const { id } = req.body;
  
  try {
    const user = await User.findById( id);
    user.fcmTokken="";
    await user.save();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json(true);
  } catch (error) {
    console.error('Error logging in:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.payment = async (req,res)=>{
  var payments = await Payment.find({userId:new mongoose.Types.ObjectId(req.params.userId)}).sort({dateTime:-1}).lean();
  console.log(req.params);
  res.json(payments);

}

exports.updateProfilePicture = async (req, res) => {
  try {
    const userId = req.body.userId;
    if (!req.file) {
      return res.status(400).send({ message: 'No file uploaded' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    user.picture = req.picture;
    await user.save();

    res.send({ picture: req.picture });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.updateAddress=async (req,res)=>{
  const { userId } = req.params;
  const { address } = req.body;
  if (!userId || !address) {
    return res.status(400).json({ error: 'User ID and address are required' });
  }
  var user = await User.findById(userId);
  user.address = address;
  await user.save();
  res.json({ message: 'Address updated successfully', user });
}

exports.signup = async (req, res) => {
  const { name, email, password , address, accountNo} = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = new User({
      name,
      email,
      password,
      accountNo,
      address
    });
    newUser.fcmTokken=req.query.fcmTokken;    
    await newUser.save();

    return res.status(201).json(newUser);
  } catch (error) {
    console.error('Error signing up:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

