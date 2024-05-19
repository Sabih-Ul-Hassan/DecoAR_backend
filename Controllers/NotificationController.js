const Notification = require('../Models/Notification');

async function getNotifications(req,res) {
  let filter = { userId: req.params.userId };
  let userType = req.params.type.toLowerCase()
  if (userType !== 'all') {
    filter.type = userType;
  }

  try {
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 }) // Sort by createdAt field in descending order (newest first)
      .exec();

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
}

module.exports = {getNotifications};
