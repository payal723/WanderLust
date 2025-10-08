const express = require("express");
const Router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const { isLoggedIn, isOwner } = require("../middleware.js");
const listingController = require("../controller/listings.js");
const multer = require('multer')
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage })


// Validation Middleware
const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body.listing);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        return next(new ExpressError(msg, 400));
    }
    next();
};

// Index + Create Routes
Router.route("/")
    .get(wrapAsync(listingController.index))
    .post(isLoggedIn, upload.array('listing[images]', 5), validateListing, wrapAsync(listingController.renderCreateForm));

// New Route 
Router.get("/new", isLoggedIn, listingController.renderNewForm);

// Show + Update + Delete Routes
Router.route("/:id")
    .get(wrapAsync(listingController.renderShowForm))
    .put(isLoggedIn, isOwner, upload.array('listing[images]', 5), validateListing, wrapAsync(listingController.renderUpdateForm))
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.renderDeleteForm));

// Edit Route 
Router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

module.exports = Router;
