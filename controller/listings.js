// const Listing = require("../models/listing.js");
// // Geocoding ke liye zaroori packages
// const { Client } = require("@google/maps");
// const googleMapsClient = new Client({});

// // --- Index Route (Aapka search/filter wala code bilkul sahi hai) ---
// module.exports.index = async (req, res) => {
//     const { category, q } = req.query;
//     let filter = {};
//     if (category && category !== "All") {
//         filter.category = category;
//     }
//     if (q) {
//         filter.location = { $regex: q, $options: 'i' };
//     }
//     const allListings = await Listing.find(filter);
//     if (allListings.length === 0 && (q || (category && category !== "All"))) {
//         req.flash("error", "Sorry, no listings found matching your search or filter.");
//         return res.redirect("/listings");
//     }
//     res.render("listings/index", { allListings, category });
// };

// // --- New Route (No changes needed) ---
// module.exports.renderNewForm = (req, res) => {
//     res.render("listings/new.ejs");
// };

// // --- Show Route (No changes needed) ---
// module.exports.renderShowForm = async (req, res) => {
//     let { id } = req.params;
//     const listing = await Listing.findById(id).populate({
//         path: "reviews", populate: {
//             path: "author",
//         }
//     }).populate("owner");
//     if (!listing) {
//         req.flash("error", "This Listing Doesn't Exist!!");
//         return res.redirect("/listings")
//     }
//     res.render("listings/show.ejs", { listing });
// };

// // --- Create Route (Geocoding Logic ke saath Updated) ---
// module.exports.renderCreateForm = async (req, res, next) => {
//     // 1. Location se coordinates nikalein
//     let response = await googleMapsClient.geocode({
//         params: {
//             address: req.body.listing.location,
//             key: process.env.GEOCODING_API_KEY,
//         },
//     });

//     // Error handling agar location ajeeb hai
//     if (!response.data.results.length) {
//         req.flash("error", "Invalid address. Please provide a valid location.");
//         return res.redirect("/listings/new");
//     }

//     const newListing = new Listing(req.body.listing);
//     newListing.owner = req.user._id;

//     if (req.file) {
//         newListing.image = {
//             url: req.file.path,
//             filename: req.file.filename
//         };
//     }

//     // 2. Coordinates ko nayi listing mein save karein
//     newListing.geometry = response.data.results[0].geometry;

//     // 3. Listing ko database mein save karein
//     await newListing.save();

//     req.flash("success", "New Listing Created!");
//     res.redirect("/listings");
// };

// // --- Edit Route (No changes needed) ---
// module.exports.renderEditForm = async (req, res) => {
//     let { id } = req.params;
//     const listing = await Listing.findById(id);
//     if (!listing) {
//         req.flash("error", "This Listing Doesn't Exist!!");
//         return res.redirect("/listings")
//     }
//     let orignalImageUrl = listing.image.url;
//     let updatedImageUrl = orignalImageUrl.replace("/upload", "/upload/w_250");
//     res.render("listings/edit.ejs", { listing, orignalImageUrl: updatedImageUrl });
// };


// // --- Update Route (Geocoding Logic ke saath Updated) ---
// module.exports.renderUpdateForm = async (req, res) => {
//     let { id } = req.params;
    
//     // Authorization check
//     let listing = await Listing.findById(id);
//     if (!listing.owner.equals(req.user._id)) {
//         req.flash("error", "You don't have permission to edit this listing!!");
//         return res.redirect(`/listings/${id}`);
//     }
    
//     // 1. Form se aaye data se listing ko update karein
//     let updatedListing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });

//     // 2. Agar location update hua hai to naye coordinates nikalein
//     let response = await googleMapsClient.geocode({
//         params: {
//             address: req.body.listing.location,
//             key: process.env.GEOCODING_API_KEY,
//         },
//     });

//     // 3. Naye coordinates ko listing mein assign karein
//     updatedListing.geometry = response.data.results[0].geometry;

//     // 4. Agar nayi image upload hui hai to use handle karein
//     if (req.file) {
//         updatedListing.image = {
//             url: req.file.path,
//             filename: req.file.filename
//         };
//     }

//     // 5. Saare badlaav (geometry aur image) ko database mein save karein
//     await updatedListing.save();

//     req.flash("success", "Listing Updated!");
//     res.redirect(`/listings/${id}`);
// };

// // --- Delete Route (No changes needed) ---
// module.exports.renderDeleteForm = async (req, res) => {
//     let { id } = req.params;
//     await Listing.findByIdAndDelete(id);
//     req.flash("success", "Listing Deleted!");

//     res.redirect("/listings");
// };



const Listing = require("../models/listing.js");
const axios = require("axios"); // Google ki jagah iska istemal hoga

// --- Advanced Index Route with Multiple Filters ---
module.exports.index = async (req, res) => {
    const { category, q, where, checkin, checkout, guests, minPrice, maxPrice, propertyType, amenities } = req.query;
    let filter = { isActive: { $ne: false } }; // Only show active listings
    
    // Category filter
    if (category && category !== "All") {
        filter.category = category;
    }
    
    // Location search (q parameter for backward compatibility)
    if (q) {
        filter.$or = [
            { location: { $regex: q, $options: 'i' } },
            { country: { $regex: q, $options: 'i' } },
            { title: { $regex: q, $options: 'i' } }
        ];
    }
    
    // Advanced search filters
    if (where) {
        filter.$or = [
            { location: { $regex: where, $options: 'i' } },
            { country: { $regex: where, $options: 'i' } },
            { title: { $regex: where, $options: 'i' } }
        ];
    }
    
    if (guests) {
        filter.maxGuests = { $gte: parseInt(guests) };
    }
    
    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = parseInt(minPrice);
        if (maxPrice) filter.price.$lte = parseInt(maxPrice);
    }
    
    if (propertyType) {
        filter.propertyType = propertyType;
    }
    
    if (amenities) {
        const amenityArray = Array.isArray(amenities) ? amenities : [amenities];
        filter.amenities = { $in: amenityArray };
    }
    
    try {
        const allListings = await Listing.find(filter).populate('owner', 'username');
        
        if (allListings.length === 0 && Object.keys(req.query).length > 0) {
            req.flash("error", "Sorry, no listings found matching your search criteria.");
        }
        
        res.render("listings/index", { 
            allListings, 
            category: category || 'All',
            searchParams: req.query
        });
    } catch (error) {
        console.error('Search error:', error);
        req.flash("error", "Something went wrong while searching.");
        res.redirect("/listings");
    }
};

// --- New Route ---
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

// --- Show Route ---
module.exports.renderShowForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({
        path: "reviews", populate: {
            path: "author",
        }
    }).populate("owner");
    if (!listing) {
        req.flash("error", "This Listing Doesn't Exist!!");
        return res.redirect("/listings")
    }
    res.render("listings/show.ejs", { listing });
};

// --- Edit Route ---
module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "This Listing Doesn't Exist!!");
        return res.redirect("/listings")
    }
    let orignalImageUrl = listing.image.url;
    let updatedImageUrl = orignalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs", { listing, orignalImageUrl: updatedImageUrl });
};

// --- Delete Route ---
module.exports.renderDeleteForm = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};


// === CREATE ROUTE (UPDATED WITH FREE GEOCODING) ===
module.exports.renderCreateForm = async (req, res, next) => {
    try {
        const location = req.body.listing.location;
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
        const response = await axios.get(url, { headers: { 'User-Agent': 'Wanderlust/1.0' } });

        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;

        if (response.data && response.data.length > 0) {
            const lon = parseFloat(response.data[0].lon);
            const lat = parseFloat(response.data[0].lat);
            newListing.geometry = { type: 'Point', coordinates: [lon, lat] };
        } else {
            req.flash("error", `Could not find coordinates for "${location}". Using a default location.`);
            newListing.geometry = { type: 'Point', coordinates: [78.9629, 20.5937] }; // Center of India
        }

        // Handle multiple images
        if (req.files && req.files.length > 0) {
            newListing.images = req.files.map(file => ({
                url: file.path,
                filename: file.filename
            }));
            // Keep first image as main image for backward compatibility
            newListing.image = {
                url: req.files[0].path,
                filename: req.files[0].filename
            };
        } else if (req.file) {
            newListing.image = { url: req.file.path, filename: req.file.filename };
        }

        await newListing.save();
        req.flash("success", "New Listing Created!");
        res.redirect("/listings");
    } catch (e) {
        console.error("Create Route Error:", e.message);
        req.flash("error", "Something went wrong. Please try again.");
        res.redirect("/listings/new");
    }
};

// === UPDATE ROUTE (UPDATED WITH FREE GEOCODING) ===
module.exports.renderUpdateForm = async (req, res) => {
    try {
        const { id } = req.params;
        let listing = await Listing.findById(id);
        if (!listing.owner.equals(req.user._id)) {
            req.flash("error", "You don't have permission to edit this!");
            return res.redirect(`/listings/${id}`);
        }
        
        const updatedListing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
        
        const location = req.body.listing.location;
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
        const response = await axios.get(url, { headers: { 'User-Agent': 'Wanderlust/1.0' } });

        if (response.data && response.data.length > 0) {
            const lon = parseFloat(response.data[0].lon);
            const lat = parseFloat(response.data[0].lat);
            updatedListing.geometry = { type: 'Point', coordinates: [lon, lat] };
        } else {
            req.flash("error", `Could not update location to "${location}". Keeping the old one.`);
        }

        // Handle multiple images
        if (req.files && req.files.length > 0) {
            updatedListing.images = req.files.map(file => ({
                url: file.path,
                filename: file.filename
            }));
            // Keep first image as main image for backward compatibility
            updatedListing.image = {
                url: req.files[0].path,
                filename: req.files[0].filename
            };
        } else if (req.file) {
            updatedListing.image = { url: req.file.path, filename: req.file.filename };
        }

        await updatedListing.save();
        req.flash("success", "Listing Updated!");
        res.redirect(`/listings/${id}`);
    } catch (e) {
        console.error("Update Route Error:", e.message);
        req.flash("error", "Something went wrong during the update.");
        res.redirect(`/listings/${req.params.id}/edit`);
    }
};