const Wishlist = require("../models/Wishlist.js");
const Listing = require("../models/listing.js");

// Get user's wishlist
module.exports.getWishlist = async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({ user: req.user._id })
            .populate({
                path: 'listings',
                populate: {
                    path: 'owner',
                    select: 'username'
                }
            });
        
        const listings = wishlist ? wishlist.listings : [];
        res.render("wishlist/index.ejs", { listings });
    } catch (error) {
        req.flash("error", "Error loading wishlist");
        res.redirect("/listings");
    }
};

// Add to wishlist
module.exports.addToWishlist = async (req, res) => {
    try {
        const { listingId } = req.params;
        
        let wishlist = await Wishlist.findOne({ user: req.user._id });
        
        if (!wishlist) {
            wishlist = new Wishlist({ user: req.user._id, listings: [] });
        }
        
        if (!wishlist.listings.includes(listingId)) {
            wishlist.listings.push(listingId);
            await wishlist.save();
            res.json({ success: true, message: "Added to wishlist", action: "added" });
        } else {
            res.json({ success: false, message: "Already in wishlist" });
        }
    } catch (error) {
        res.json({ success: false, message: "Error adding to wishlist" });
    }
};

// Remove from wishlist
module.exports.removeFromWishlist = async (req, res) => {
    try {
        const { listingId } = req.params;
        
        const wishlist = await Wishlist.findOne({ user: req.user._id });
        
        if (wishlist) {
            wishlist.listings = wishlist.listings.filter(id => !id.equals(listingId));
            await wishlist.save();
            res.json({ success: true, message: "Removed from wishlist", action: "removed" });
        } else {
            res.json({ success: false, message: "Wishlist not found" });
        }
    } catch (error) {
        res.json({ success: false, message: "Error removing from wishlist" });
    }
};

// Check if listing is in wishlist
module.exports.checkWishlist = async (req, res) => {
    try {
        if (!req.user) {
            return res.json({ inWishlist: false });
        }
        
        const { listingId } = req.params;
        const wishlist = await Wishlist.findOne({ user: req.user._id });
        
        const inWishlist = wishlist && wishlist.listings.includes(listingId);
        res.json({ inWishlist });
    } catch (error) {
        res.json({ inWishlist: false });
    }
};