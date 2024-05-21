var ProductModel = require("../Models/ProductModel")
var UserModel = require('../Models/UserModel');
var ReviewModel = require("../Models/ReviewModel")
var UserReviewsModel = require('../Models/UserReviewsModel')
var mongoose=require('mongoose')
var getReviews =  async (req,res)=>{
    try {
        const userId =new  mongoose.Types.ObjectId(req.params.userId);
        const productId =new mongoose.Types.ObjectId(req.params.productId);
        const userReview = await ReviewModel.findOne({ userId, productId });
        const otherReviews = await ReviewModel.find({ productId, userId: { $ne: userId } });
        res.status(200).json({
          userReview,
          otherReviews,
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
      }
}
var getUserReviews =  async (req,res)=>{
    try {
        const userId =new  mongoose.Types.ObjectId(req.params.userId);
        const ReviewedUsersId =new mongoose.Types.ObjectId(req.params.ReviewedUsersId);
        const userReview = await UserReviewsModel.findOne({ userId, ReviewedUsersId });
        const otherReviews = await UserReviewsModel.find({ ReviewedUsersId, userId: { $ne: userId } });
        res.status(200).json({
          userReview,
          otherReviews,
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
      }
}

var postReview = async (req, res) => {
  const { productId, userId, stars, review } = req.body;
  const user = await UserModel.findOne({_id:userId});

  try {
    const newReview = new ReviewModel({
      productId,
      userId,
      stars,
      review,
      username: user.name, 
    });
    await newReview.save();
    res.json({ status: 'success', message: 'Review uploaded successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};
var postUsersReview = async (req, res) => {
  const { ReviewedUsersId, userId, stars, review } = req.body; 
  const user = await UserModel.findOne({_id:userId});
    try {
    const newReview = new UserReviewsModel({
      ReviewedUsersId,
      userId,
      stars,
      review,
      username: user.name, 
    });
    await newReview.save();
    res.json({ status: 'success', message: 'Review uploaded successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

var updateReview = async (req, res) => {
  const reviewId = req.params.reviewId;
  const { stars, review } = req.body;

  try {
    const existingReview = await ReviewModel.findById(reviewId);
    if (!existingReview) {
      return res.status(404).json({ status: 'error', message: 'Review not found' });
    }
    existingReview.stars = stars;
    existingReview.review = review;
    await existingReview.save();
    res.json({ status: 'success', message: 'Review updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

var updateUsersReview = async (req, res) => {
  const reviewId = req.params.reviewId;
  const { stars, review } = req.body;

  try {
    const existingReview = await UserReviewsModel.findById(reviewId);
    if (!existingReview) {
      return res.status(404).json({ status: 'error', message: 'Review not found' });
    }
    existingReview.stars = stars;
    existingReview.review = review;
    await existingReview.save();
    res.json({ status: 'success', message: 'Review updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

const sendNotification = async (token, title, body, data) => {
  try {
    const message = {
      token: token,
      notification: {
        title: title,
        body: body,
      },
      data: data || {},
    };

    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);

  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

module.exports = { postReview, updateReview,getReviews,getUserReviews,postUsersReview,updateUsersReview };
