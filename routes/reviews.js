var express = require('express');
var router = express.Router();
var reviewsController = require("../Controllers/ReviewsController")

router.get('/:productId/:userId', reviewsController.getReviews);
router.post('/upload',reviewsController.postReview );
router.put('/update/:reviewId', reviewsController.updateReview);

router.get('/user/:ReviewedUsersId/:userId', reviewsController.getUserReviews);
router.post('/user/upload',reviewsController.postUsersReview );
router.put('/user/update/:reviewId', reviewsController.updateUsersReview);


module.exports = router;
