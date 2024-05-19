const User = require('../Models/UserModel'); 

async function getFCMTokenByUserID(userID) {
    try {
        const user = await User.findById(userID);

        if (user) {
            return user.fcmTokken;
        } else {
            console.log('User not found');
            return null;
        }
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
}

module.exports = {getFCMTokenByUserID};