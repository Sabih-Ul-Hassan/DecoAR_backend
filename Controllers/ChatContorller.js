const Chat = require('../Models/ChatModel');
const User = require('../Models/UserModel');
var {sendNotification}= require("../Functions/sendNotification")


async function getAllChats(req,res) {
    var userId=req.params.userId;
    try {
    const userChats = await Chat.find({ 'users.userId': userId, 'messages.0': { $exists: true } }).populate({
      path: 'users.userId',
      model: 'User'
    });

    const formattedChats = userChats.map(chat => {
      const otherUser = chat.users.find(user => user.userId._id.toString() !== userId);
      const requestingUser = chat.users.find(user => user.userId._id.toString() === userId);
      
      const lastMessage = chat.messages.length > 0 ? chat.messages[chat.messages.length - 1] : null;

      const userHasReadAllMessages = lastMessage ? lastMessage.timestamp <= requestingUser.lastRead : false;

      return {
        chatId: chat._id,
        otherUserId: otherUser.userId._id,
        otherUserName: otherUser.userId.name,
        otherUserPicture: otherUser.userId.picture,
        lastMessage: lastMessage ? lastMessage.content.length<60 ? lastMessage.content : lastMessage.content.substring(0,57)+'...' : null,
        userHasReadAllMessages,
      };
    });

    res.json(formattedChats);
  } catch (error) {
    console.error('Error fetching user chats:', error);
    throw error;
  }
}

async function getOrCreateChat(req, res) {
  try {
    const { requestingUserId, userId2 } = req.params;
    const userId1 = requestingUserId;

    // Check if a chat already exists between the two users
    const existingChat = await Chat.findOne({
      'users.userId': { $all: [userId1, userId2] },
    }).populate({
        path: 'users.userId',
        model: 'User'
      });

    if (existingChat) {
      // Update the requesting user's lastRead timestamp
      const requestingUserIndex = existingChat.users.findIndex(
        user => user.userId._id.toString() === requestingUserId
      );
      if (requestingUserIndex !== -1) {
        existingChat.users[requestingUserIndex].lastRead = new Date();
        await existingChat.save();
      }

      return res.json(existingChat);
    }

    // If no existing chat, create a new one
    const users = [
      { userId: userId1, lastActive: null, lastRead: new Date() }, // Update lastRead for the requesting user
      { userId: userId2, lastActive: null, lastRead: null },
    ];
    const newChat = await Chat.create({ users });
    const populatedChat = await newChat
      .populate({
        path: 'users.userId',
        model: 'User',
      }) ;
    
    return res.json(populatedChat)
  } catch (error) {
    console.error('Error getting or creating chat:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}


async function sendMessage(req, res) {
  try {
    const { chatId } = req.params;
    const { senderId, content } = req.body;

    const chat = await Chat.findById(chatId).populate('users.userId');

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    var senderName="";

    const newMessage = {
      sender: senderId,
      content,
      timestamp: new Date(),
    };

    chat.messages.push(newMessage);

    const senderIndex = chat.users.findIndex(user => user.userId._id.toString() === senderId);
    if (senderIndex !== -1) {
      chat.users[senderIndex].lastRead = new Date();
      senderName=chat.users[senderIndex].userId.name
    }

    await chat.save();
    var receptentId;
    const recipientTokens = chat.users
      .filter(user => user.userId._id.toString() !== senderId)
      .map(user => {
        receptentId=user.userId._id;
        return user.userId.fcmTokken
        }
      );

    recipientTokens.forEach(token => {
      sendNotification(token, senderName , newMessage.content, {
        type:'msg',
        message:newMessage,
        otherUser:receptentId,
        user:senderId

      });
    });

    return res.json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

  

  

async function updateLastRead(req, res) {
    try {
      const { chatId, userId } = req.params;
  
      const chat = await Chat.findById(chatId);
  
      if (!chat) {
        return res.status(404).json({ error: 'Chat not found' });
      }
      const userIndex = chat.users.findIndex(user => user.userId.toString() === userId);
  
      if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found in the chat' });
      }
      chat.users[userIndex].lastRead = new Date();
      await chat.save();
  
      return res.json({ message: 'LastRead updated successfully', chat });
    } catch (error) {
      console.error('Error updating lastRead:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
  
  

module.exports = {
  getAllChats, getOrCreateChat,sendMessage, updateLastRead
};
