// // models/listing.js

// const mongoose = require("mongoose");
// const Schema = mongoose.Schema;
// const Review = require("./Review.js");
// const listingSchema = new Schema({
//     title: {
//         type: String,
//         required: true
//     },
//     description: {
//         type: String,
//         trim: true
//     },
//     image: {
//         filename: {
//             type: String,
//             default: "listingimage"
//         },
//         url: {
//             type: String,
//             default: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=60"
//         }
//     },
//     price: {
//         type: Number,
//         default: 0,
//         min: 0
//     },
//     location: {
//         type: String,
//         trim: true
//     },
//     country: {
//         type: String,
//         trim: true,
//     },

//     reviews: [
//         {
//             type: Schema.Types.ObjectId,
//             ref: "Review"
//         },
//     ],
//     owner:{
//         type : Schema.Types.ObjectId,
//         ref : "User"
//     },
//       geometry: {
//         type: {
//             type: String,
//             enum: ['Point'], // 'location.type' must be 'Point'
//             required: true
//         },
//         coordinates: {
//             type: [Number], // [longitude, latitude]
//             required: true
//         }
//     },
//      category: {
//     type: String,
//     enum: ['Amazing views', 'Beachfront', 'Cabins', 'Towers', 'All'] // अपनी सभी कैटेगरी यहाँ डालें
//   },



// }, { timestamps: true });

// listingSchema.post("findOneAndDelete", async (listing) => {
//     if (listing) {
//         await Review.deleteMany({
//             _id: {
//                 $in: listing.reviews
//             }
//         });
//     }

// })
// const Listing = mongoose.models.Listing || mongoose.model("Listing", listingSchema);
// module.exports = Listing;




const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./Review.js");

const listingSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, trim: true },
    images: [{
        filename: { type: String, default: "listingimage" },
        url: { type: String, default: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=60" }
    }],
    // Backward compatibility
    image: {
        filename: { type: String, default: "listingimage" },
        url: { type: String, default: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=60" }
    },
    price: { type: Number, default: 0, min: 0 },
    location: { type: String, trim: true },
    country: { type: String, trim: true },
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
    owner: { type: Schema.Types.ObjectId, ref: "User" },

    // === YEH FIELD HONA BAHUT ZAROORI HAI ===
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    },
    // =======================================

    category: { type: String, enum: ['Amazing views', 'Beachfront', 'Cabins', 'Towers', 'All'] },
    
    // Advanced fields
    amenities: [{
        type: String,
        enum: ['WiFi', 'Kitchen', 'Parking', 'Pool', 'Gym', 'AC', 'TV', 'Washer', 'Pets allowed']
    }],
    maxGuests: { type: Number, default: 2, min: 1 },
    bedrooms: { type: Number, default: 1, min: 1 },
    bathrooms: { type: Number, default: 1, min: 1 },
    propertyType: {
        type: String,
        enum: ['Apartment', 'House', 'Villa', 'Cabin', 'Hotel', 'Resort'],
        default: 'Apartment'
    },
    isActive: { type: Boolean, default: true },
    viewCount: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalBookings: { type: Number, default: 0 }
}, { timestamps: true });

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

const Listing = mongoose.models.Listing || mongoose.model("Listing", listingSchema);
module.exports = Listing;