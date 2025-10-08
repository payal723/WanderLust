const Listing = require('../models/listing');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const User = require('../models/user');

// Dashboard analytics
module.exports.getDashboard = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Get user's listings
        const userListings = await Listing.find({ owner: userId });
        const listingIds = userListings.map(l => l._id);
        
        // Basic stats
        const totalListings = userListings.length;
        const totalBookings = await Booking.countDocuments({ 
            listing: { $in: listingIds } 
        });
        const totalRevenue = await Booking.aggregate([
            { $match: { listing: { $in: listingIds }, status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);
        
        // Recent bookings
        const recentBookings = await Booking.find({ 
            listing: { $in: listingIds } 
        }).populate('listing', 'title').populate('guest', 'username').sort({ createdAt: -1 }).limit(5);
        
        // Monthly revenue chart data
        const monthlyRevenue = await Booking.aggregate([
            { 
                $match: { 
                    listing: { $in: listingIds }, 
                    status: 'completed',
                    createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
                } 
            },
            {
                $group: {
                    _id: { 
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    revenue: { $sum: '$totalPrice' },
                    bookings: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);
        
        // Top performing listings
        const topListings = await Booking.aggregate([
            { $match: { listing: { $in: listingIds } } },
            { 
                $group: { 
                    _id: '$listing', 
                    bookings: { $sum: 1 },
                    revenue: { $sum: '$totalPrice' }
                } 
            },
            { $sort: { revenue: -1 } },
            { $limit: 5 }
        ]);
        
        await Listing.populate(topListings, { path: '_id', select: 'title image' });
        
        const analytics = {
            totalListings,
            totalBookings,
            totalRevenue: totalRevenue[0]?.total || 0,
            recentBookings,
            monthlyRevenue,
            topListings
        };
        
        res.render('analytics/dashboard', { analytics });
    } catch (error) {
        console.error(error);
        req.flash('error', 'Could not load analytics');
        res.redirect('/listings');
    }
};

// Listing performance
module.exports.getListingAnalytics = async (req, res) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id);
        
        if (!listing || !listing.owner.equals(req.user._id)) {
            req.flash('error', 'Listing not found');
            return res.redirect('/analytics');
        }
        
        // Booking stats
        const bookingStats = await Booking.aggregate([
            { $match: { listing: listing._id } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    revenue: { $sum: '$totalPrice' }
                }
            }
        ]);
        
        // Reviews stats
        const reviewStats = await Review.aggregate([
            { $match: { listing: listing._id } },
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 }
                }
            }
        ]);
        
        // Monthly bookings
        const monthlyBookings = await Booking.aggregate([
            { $match: { listing: listing._id } },
            {
                $group: {
                    _id: { 
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    bookings: { $sum: 1 },
                    revenue: { $sum: '$totalPrice' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);
        
        const analytics = {
            listing,
            bookingStats,
            reviewStats: reviewStats[0] || { avgRating: 0, totalReviews: 0 },
            monthlyBookings
        };
        
        res.render('analytics/listing', { analytics });
    } catch (error) {
        console.error(error);
        req.flash('error', 'Could not load listing analytics');
        res.redirect('/analytics');
    }
};