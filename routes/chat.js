const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const { isLoggedIn } = require('../middleware');
const wrapAsync = require('../utils/wrapAsync');

// Get chat messages between two users
router.get('/messages/:userId', isLoggedIn, wrapAsync(async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user._id;

  const messages = await Chat.find({
    $or: [
      { sender: currentUserId, receiver: userId },
      { sender: userId, receiver: currentUserId }
    ]
  })
  .populate('sender', 'username')
  .populate('receiver', 'username')
  .sort({ createdAt: 1 })
  .limit(50);

  res.json({ success: true, messages });
}));

// Get user's chat list
router.get('/conversations', isLoggedIn, wrapAsync(async (req, res) => {
  const userId = req.user._id;

  const conversations = await Chat.aggregate([
    {
      $match: {
        $or: [
          { sender: userId },
          { receiver: userId }
        ]
      }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $group: {
        _id: {
          $cond: [
            { $eq: ['$sender', userId] },
            '$receiver',
            '$sender'
          ]
        },
        lastMessage: { $first: '$message' },
        lastMessageTime: { $first: '$createdAt' },
        unreadCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$receiver', userId] },
                  { $eq: ['$isRead', false] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $unwind: '$user'
    },
    {
      $project: {
        userId: '$_id',
        username: '$user.username',
        lastMessage: 1,
        lastMessageTime: 1,
        unreadCount: 1
      }
    },
    {
      $sort: { lastMessageTime: -1 }
    }
  ]);

  res.json({ success: true, conversations });
}));

// Mark messages as read
router.patch('/messages/:userId/read', isLoggedIn, wrapAsync(async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user._id;

  await Chat.updateMany(
    {
      sender: userId,
      receiver: currentUserId,
      isRead: false
    },
    {
      isRead: true,
      readAt: new Date()
    }
  );

  res.json({ success: true });
}));

// Delete conversation
router.delete('/conversation/:userId', isLoggedIn, wrapAsync(async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user._id;

  await Chat.deleteMany({
    $or: [
      { sender: currentUserId, receiver: userId },
      { sender: userId, receiver: currentUserId }
    ]
  });

  res.json({ success: true });
}));

// Search users for chat
router.get('/users/search', isLoggedIn, wrapAsync(async (req, res) => {
  const { q } = req.query;
  const User = require('../models/user');

  if (!q || q.length < 2) {
    return res.json({ success: true, users: [] });
  }

  const users = await User.find({
    username: { $regex: q, $options: 'i' },
    _id: { $ne: req.user._id }
  })
  .select('username')
  .limit(10);

  res.json({ success: true, users });
}));

module.exports = router;