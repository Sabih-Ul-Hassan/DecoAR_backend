const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const userSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  lastActive: {
    type: Date,
    default: null,
  },
  lastRead: {
    type: Date,
    default: null,
  },
});

const chatSchema = new mongoose.Schema({
  users: [userSchema],
  messages: [messageSchema],
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
