const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware.js");
const wishlistController = require("../controller/wishlist.js");

// Get wishlist
router.get("/", isLoggedIn, wishlistController.getWishlist);

// Add to wishlist
router.post("/add/:listingId", isLoggedIn, wishlistController.addToWishlist);

// Remove from wishlist
router.delete("/remove/:listingId", isLoggedIn, wishlistController.removeFromWishlist);

// Check if in wishlist
router.get("/check/:listingId", wishlistController.checkWishlist);

module.exports = router;