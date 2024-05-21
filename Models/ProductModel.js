
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  deleted: {
    default:true,
    type:Boolean
  },
  availability: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  shippingInfo: {
    type: String,
    required: true,
  },
  shippingPrice: {
    type: Number,
    required: true,
  },
  tags: {
    type: [String],
    default: [],
  },
  images: {
    type: [String],
    default: [],
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  alternativeModelText: {
    type: String, 
  },
  placement: {
    type: String, 
  },
  backgroundModelColor: {
    type: String, 
    default: 'transparent',
  },
  
  model: {
    type: String,
  },
  
}, {
  timestamps: true 
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
 