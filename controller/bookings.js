const Booking = require('../models/Booking');
const Listing = require('../models/listing');
const Notification = require('../models/Notification');

// Create booking
module.exports.createBooking = async (req, res) => {
    try {
        const { listingId } = req.params;
        const { checkIn, checkOut, guests, specialRequests } = req.body;
        
        const listing = await Listing.findById(listingId).populate('owner');
        if (!listing) {
            req.flash('error', 'Listing not found');
            return res.redirect('/listings');
        }
        
        // Calculate total price
        const days = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
        const totalPrice = days * listing.price;
        
        const booking = new Booking({
            listing: listingId,
            guest: req.user._id,
            host: listing.owner._id,
            checkIn: new Date(checkIn),
            checkOut: new Date(checkOut),
            guests: parseInt(guests),
            totalPrice,
            specialRequests
        });
        
        await booking.save();
        
        // Create notification for host
        await new Notification({
            recipient: listing.owner._id,
            sender: req.user._id,
            type: 'booking_request',
            message: `New booking request for ${listing.title}`,
            relatedId: booking._id
        }).save();
        
        req.flash('success', 'Booking request sent successfully!');
        res.redirect(`/bookings/${booking._id}`);
    } catch (error) {
        console.error(error);
        req.flash('error', 'Something went wrong');
        res.redirect('/listings');
    }
};

// Get user bookings
module.exports.getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({
            $or: [{ guest: req.user._id }, { host: req.user._id }]
        }).populate('listing').populate('guest', 'username email').populate('host', 'username email').sort({ createdAt: -1 });
        
        res.render('bookings/index', { bookings });
    } catch (error) {
        console.error(error);
        req.flash('error', 'Could not load bookings');
        res.redirect('/listings');
    }
};

// Show booking details
module.exports.showBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('listing')
            .populate('guest', 'username email')
            .populate('host', 'username email');
            
        if (!booking) {
            req.flash('error', 'Booking not found');
            return res.redirect('/bookings');
        }
        
        res.render('bookings/show', { booking });
    } catch (error) {
        console.error(error);
        req.flash('error', 'Could not load booking');
        res.redirect('/bookings');
    }
};

// Update booking status
module.exports.updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findById(req.params.id).populate('listing').populate('guest');
        
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }
        
        booking.status = status;
        await booking.save();
        
        // Create notification
        const recipient = booking.host.equals(req.user._id) ? booking.guest._id : booking.host._id;
        await new Notification({
            recipient,
            sender: req.user._id,
            type: 'booking_update',
            message: `Booking ${status} for ${booking.listing.title}`,
            relatedId: booking._id
        }).save();
        
        res.json({ success: true, message: `Booking ${status} successfully` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};