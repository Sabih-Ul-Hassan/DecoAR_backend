const Notification = require('../Models/Notification');

async function addNotification(notificationContent, userId, type) {
  try {
    const notification = new Notification({
      notification: notificationContent,
      userId: userId,
      type: type
    });

    await notification.save();

    console.log('Notification added successfully');
    return notification; 
  } catch (error) {
    console.error('Error adding notification:', error);
    throw error;   }
}
module.exports={addNotification}