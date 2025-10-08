const Listing = require("./models/listing");
const Review = require("./models/Review");
const ExpressError = require("./utils/ExpressError");
const { listingSchema, reviewSchema } = require("./schema.js");

module.exports.isLoggedIn = (req, res, next) => {
   if (!req.isAuthenticated()) {
      req.session.redirectUrl = req.originalUrl;
      req.flash("error", "You must be logged in to create listing!");
      return res.redirect("/login");
   }
   next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
   if (req.session.redirectUrl) {
      res.locals.redirectUrl = req.session.redirectUrl;
   }
   next();
};

module.exports.isOwner = async (req, res, next) => {
   let { id } = req.params;
   let listing = await Listing.findById(id);
   if (!listing.owner.equals(req.user._id)) {
      req.flash("error", "You do not have permission to do that!");
      return res.redirect(`/listings/${id}`);
   }
   next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
   const {id, reviewId } = req.params;
   const review = await Review.findById(reviewId);
   if (!review) {
      req.flash("error", "Review not found!");
      return res.redirect(`/listings/${id}`);
   }
   if (!review.author.equals(req.user._id)) {
      req.flash("error", "You do not have permission to do that!");
      return res.redirect(`/listings/${id}`);
   }
   next();
};
