const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false }
});

const chatSchema = new Schema({
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    listing: { type: Schema.Types.ObjectId, ref: 'Listing' },
    booking: { type: Schema.Types.ObjectId, ref: 'Booking' },
    messages: [messageSchema],
    lastMessage: {
        content: String,
        timestamp: { type: Date, default: Date.now },
        sender: { type: Schema.Types.ObjectId, ref: 'User' }
    },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

chatSchema.index({ participants: 1 });
chatSchema.index({ listing: 1 });

module.exports = mongoose.model('Chat', chatSchema);