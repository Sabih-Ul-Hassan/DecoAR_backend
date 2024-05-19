const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  notification: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  type: {
    type: String,
    enum: ['seller', 'user'], 
    required: true
  }
}, {
  timestamps: true 
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
