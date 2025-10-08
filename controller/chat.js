const Chat = require('../models/Chat');
const User = require('../models/user');

// Get all chats for user
module.exports.getUserChats = async (req, res) => {
    try {
        const chats = await Chat.find({
            participants: req.user._id,
            isActive: true
        }).populate('participants', 'username').populate('listing', 'title').sort({ 'lastMessage.timestamp': -1 });
        
        res.render('chat/index', { chats });
    } catch (error) {
        console.error(error);
        req.flash('error', 'Could not load chats');
        res.redirect('/listings');
    }
};

// Get specific chat
module.exports.getChat = async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.id)
            .populate('participants', 'username')
            .populate('listing', 'title')
            .populate('messages.sender', 'username');
            
        if (!chat || !chat.participants.some(p => p._id.equals(req.user._id))) {
            req.flash('error', 'Chat not found');
            return res.redirect('/chat');
        }
        
        // Mark messages as read
        chat.messages.forEach(msg => {
            if (!msg.sender.equals(req.user._id)) {
                msg.isRead = true;
            }
        });
        await chat.save();
        
        res.render('chat/show', { chat });
    } catch (error) {
        console.error(error);
        req.flash('error', 'Could not load chat');
        res.redirect('/chat');
    }
};

// Send message
module.exports.sendMessage = async (req, res) => {
    try {
        const { content } = req.body;
        const chat = await Chat.findById(req.params.id);
        
        if (!chat || !chat.participants.includes(req.user._id)) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }
        
        const message = {
            sender: req.user._id,
            content,
            timestamp: new Date()
        };
        
        chat.messages.push(message);
        chat.lastMessage = {
            content,
            timestamp: new Date(),
            sender: req.user._id
        };
        
        await chat.save();
        
        res.json({ success: true, message: 'Message sent' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Create new chat
module.exports.createChat = async (req, res) => {
    try {
        const { recipientId, listingId } = req.body;
        
        // Check if chat already exists
        let chat = await Chat.findOne({
            participants: { $all: [req.user._id, recipientId] },
            listing: listingId
        });
        
        if (!chat) {
            chat = new Chat({
                participants: [req.user._id, recipientId],
                listing: listingId
            });
            await chat.save();
        }
        
        res.json({ success: true, chatId: chat._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};