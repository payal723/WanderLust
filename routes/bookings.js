const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware');
const bookingController = require('../controller/bookings');
const wrapAsync = require('../utils/wrapAsync');

// Get all user bookings
router.get('/', isLoggedIn, wrapAsync(bookingController.getUserBookings));

// Show specific booking
router.get('/:id', isLoggedIn, wrapAsync(bookingController.showBooking));

// Create new booking
router.post('/listings/:listingId', isLoggedIn, wrapAsync(bookingController.createBooking));

// Update booking status
router.patch('/:id/status', isLoggedIn, wrapAsync(bookingController.updateBookingStatus));

module.exports = router;