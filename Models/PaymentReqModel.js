const mongoose = require('mongoose');

const paymentReqSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    trim: true
  },
  balance: {
    type: Number,
    required: true,
    min: 0
  },
  userId: {
    type: mongoose.Types.ObjectId,
    required:true
  },
  accountNo: {
    type: String,
    required: true,
    trim: true
  },
  paid: {
    type: Boolean,
    required: true,
    default: false
  }
}, {
  timestamps: true 
});
const PaymentReq = mongoose.model('PaymentReq', paymentReqSchema);

module.exports = PaymentReq;
