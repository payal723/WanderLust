const express = require("express");
const Router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js"); 
const mongoose = require("mongoose");
const ExpressError = require("../utils/ExpressError.js"); 
const { reviewSchema } = require("../schema.js"); 
const Listing = require("../models/listing.js"); 
const Review = require("../models/Review.js"); 
const { isLoggedIn,isOwner, isReviewAuthor } = require("../middleware.js");

const reviewController = require("../controller/reviews.js");


const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(',');
    return next(new ExpressError(msg, 400));
  }
  next();
};


// REVIEW DELETE ROUTE
Router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewController.deleteReview));



//create review routes
Router.post("/", isLoggedIn,validateReview, wrapAsync(reviewController.createReview));

//edit review route

Router.get("/:reviewId/edit", isLoggedIn, isReviewAuthor, wrapAsync(reviewController.editReview));

module.exports = Router;
