var express = require('express');
var router = express.Router();
var reviewsController = require("../Controllers/ReviewsController")

router.get('/:productId/:userId', reviewsController.getReviews);
router.post('/upload',reviewsController.postReview );
router.put('/update/:reviewId', reviewsController.updateReview);


module.exports = router;
