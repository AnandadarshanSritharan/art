const mongoose = require('mongoose');

const conversationSchema = mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    lastMessage: {
        content: String,
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        timestamp: Date
    },
    unreadCount: {
        type: Map,
        of: Number,
        default: {}
    }
}, {
    timestamps: true,
});

// Index for faster queries
conversationSchema.index({ participants: 1 });

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
