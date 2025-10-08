const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware.js");
const notificationController = require("../controller/notifications.js");

// Render notifications page
router.get("/", isLoggedIn, (req, res) => {
    res.render("notifications/index");
});

// Get notifications API
router.get("/api", isLoggedIn, notificationController.getNotifications);

// Get unread count
router.get("/unread-count", isLoggedIn, notificationController.getUnreadCount);
router.get("/count", isLoggedIn, notificationController.getUnreadCount);

// Mark as read
router.patch("/:notificationId/read", isLoggedIn, notificationController.markAsRead);

// Mark all as read
router.patch("/mark-all-read", isLoggedIn, notificationController.markAllAsRead);

module.exports = router;