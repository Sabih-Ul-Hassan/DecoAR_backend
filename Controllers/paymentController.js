const PaymentReq = require('../Models/PaymentReqModel');
const User = require("../Models/UserModel")

exports.getAllUnpaidRequests = async (req, res) => {
  try {
    const unpaidRequests = await PaymentReq.find({ paid: false });
    res.status(200).json(unpaidRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

 

exports.addPaymentRequest = async (req, res) => {
  try {
    const { userName, balance, accountNo, account ,userId} = req.body;

    const paymentReq = new PaymentReq({
      userName,
      balance,
      accountNo,
      userId,
      paid: false 
    });

   
    await paymentReq.save();

    res.status(201).json({ message: 'Payment request added successfully', paymentReq });
  } catch (error) {
    console.error('Error adding payment request:', error);
    res.status(500).json({ error: 'Failed to add payment request' });
  }
};
exports.markPaid = async (req, res) => {
  try {
    const paymentReq = await PaymentReq.findById(req.params.id);
    if (!paymentReq) {
      return res.status(404).json({ message: 'Payment request not found' });
    }
    paymentReq.paid = true;
    var user = await User.findById(paymentReq.userId);
    const balance = parseInt(req.params.amount);
    user.balance = user.balance - balance;
    await paymentReq.save();

    await user.save();
    console.log("done")
    res.status(200).json({ message: 'Payment request marked as paid', paymentReq });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message });
  }
};
