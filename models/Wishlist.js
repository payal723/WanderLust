const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const wishlistSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    listings: [{
        type: Schema.Types.ObjectId,
        ref: "Listing"
    }]
}, { timestamps: true });

// Ensure one wishlist per user
wishlistSchema.index({ user: 1 }, { unique: true });

const Wishlist = mongoose.model("Wishlist", wishlistSchema);
module.exports = Wishlist;