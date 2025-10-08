const Notification = require("../models/Notification.js");

// Get user notifications
module.exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20);
        
        res.json({ notifications });
    } catch (error) {
        res.status(500).json({ error: "Error fetching notifications" });
    }
};

// Mark notification as read
module.exports.markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        
        await Notification.findByIdAndUpdate(
            notificationId,
            { isRead: true },
            { new: true }
        );
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Error marking notification as read" });
    }
};

// Mark all notifications as read
module.exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.user._id, isRead: false },
            { isRead: true }
        );
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Error marking notifications as read" });
    }
};

// Create notification (helper function)
module.exports.createNotification = async (userId, type, title, message, relatedListing = null, actionUrl = null) => {
    try {
        const notification = new Notification({
            user: userId,
            type,
            title,
            message,
            relatedListing,
            actionUrl
        });
        
        await notification.save();
        return notification;
    } catch (error) {
        console.error("Error creating notification:", error);
        return null;
    }
};

// Get unread count
module.exports.getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            user: req.user._id,
            isRead: false
        });
        
        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: "Error getting unread count" });
    }
};