const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
});

// Index for faster queries
messageSchema.index({ conversation: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
