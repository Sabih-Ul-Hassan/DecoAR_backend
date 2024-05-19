
const User = require('../Models/UserModel');

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

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = new User({
      name,
      email,
      password
    });
    newUser.fcmTokken=req.query.fcmTokken;    
    await newUser.save();

    return res.status(201).json(newUser);
  } catch (error) {
    console.error('Error signing up:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
