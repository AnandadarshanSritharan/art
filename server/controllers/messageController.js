const asyncHandler = require('express-async-handler');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// @desc    Get all conversations for logged-in user
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = asyncHandler(async (req, res) => {
    const conversations = await Conversation.find({
        participants: req.user._id
    })
        .populate('participants', 'name email profileImage')
        .sort({ 'lastMessage.timestamp': -1 });

    // Calculate unread count for current user
    const conversationsWithUnread = conversations.map(conv => {
        const unreadCount = conv.unreadCount.get(req.user._id.toString()) || 0;
        return {
            ...conv.toObject(),
            unreadCount
        };
    });

    res.json(conversationsWithUnread);
});

// @desc    Get messages for a conversation
// @route   GET /api/messages/:conversationId
// @access  Private
const getMessages = asyncHandler(async (req, res) => {
    const conversation = await Conversation.findById(req.params.conversationId);

    if (!conversation) {
        res.status(404);
        throw new Error('Conversation not found');
    }

    // Check if user is participant
    if (!conversation.participants.includes(req.user._id)) {
        res.status(403);
        throw new Error('Not authorized');
    }

    const messages = await Message.find({ conversation: req.params.conversationId })
        .populate('sender', 'name profileImage')
        .sort({ createdAt: 1 });

    res.json(messages);
});

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
    const { recipientId, content } = req.body;

    if (!content || !recipientId) {
        res.status(400);
        throw new Error('Content and recipient required');
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({
        participants: { $all: [req.user._id, recipientId] }
    });

    if (!conversation) {
        conversation = await Conversation.create({
            participants: [req.user._id, recipientId],
            unreadCount: {
                [req.user._id.toString()]: 0,
                [recipientId]: 0
            }
        });
    }

    // Create message
    const message = await Message.create({
        conversation: conversation._id,
        sender: req.user._id,
        content
    });

    // Update conversation
    conversation.lastMessage = {
        content,
        sender: req.user._id,
        timestamp: new Date()
    };

    // Increment unread count for recipient
    const currentUnread = conversation.unreadCount.get(recipientId) || 0;
    conversation.unreadCount.set(recipientId, currentUnread + 1);

    await conversation.save();

    const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'name profileImage');

    res.status(201).json(populatedMessage);
});

// @desc    Mark messages as read
// @route   PUT /api/messages/:conversationId/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
    const conversation = await Conversation.findById(req.params.conversationId);

    if (!conversation) {
        res.status(404);
        throw new Error('Conversation not found');
    }

    // Check if user is participant
    if (!conversation.participants.includes(req.user._id)) {
        res.status(403);
        throw new Error('Not authorized');
    }

    // Mark all unread messages as read
    await Message.updateMany(
        {
            conversation: req.params.conversationId,
            sender: { $ne: req.user._id },
            read: false
        },
        { read: true }
    );

    // Reset unread count for this user
    conversation.unreadCount.set(req.user._id.toString(), 0);
    await conversation.save();

    // Emit socket event to both participants to update unread count
    const io = req.app.get('io');

    // Emit to the user who read the messages
    io.to(req.user._id.toString()).emit('messagesRead', {
        conversationId: req.params.conversationId
    });

    // Emit to the other participant(s) so their UI updates
    conversation.participants.forEach(participantId => {
        if (participantId.toString() !== req.user._id.toString()) {
            io.to(participantId.toString()).emit('messagesRead', {
                conversationId: req.params.conversationId
            });
        }
    });

    res.json({ message: 'Messages marked as read' });
});

// @desc    Search conversations
// @route   GET /api/messages/search
// @access  Private
const searchConversations = asyncHandler(async (req, res) => {
    const { query } = req.query;

    if (!query) {
        res.status(400);
        throw new Error('Search query required');
    }

    const conversations = await Conversation.find({
        participants: req.user._id
    })
        .populate('participants', 'name email profileImage');

    // Filter by username or last message content
    const filtered = conversations.filter(conv => {
        const otherParticipant = conv.participants.find(p => p._id.toString() !== req.user._id.toString());
        const nameMatch = otherParticipant?.name.toLowerCase().includes(query.toLowerCase());
        const messageMatch = conv.lastMessage?.content.toLowerCase().includes(query.toLowerCase());
        return nameMatch || messageMatch;
    });

    res.json(filtered);
});

// @desc    Search messages within a conversation
// @route   GET /api/messages/:conversationId/search
// @access  Private
const searchMessagesInConversation = asyncHandler(async (req, res) => {
    const { query } = req.query;
    const { conversationId } = req.params;

    if (!query) {
        res.status(400);
        throw new Error('Search query required');
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
        res.status(404);
        throw new Error('Conversation not found');
    }

    // Check if user is participant
    if (!conversation.participants.includes(req.user._id)) {
        res.status(403);
        throw new Error('Not authorized');
    }

    const messages = await Message.find({
        conversation: conversationId,
        content: { $regex: query, $options: 'i' }
    })
        .populate('sender', 'name profileImage')
        .sort({ createdAt: -1 }); // Newest first for search results

    res.json(messages);
});

module.exports = {
    getConversations,
    getMessages,
    sendMessage,
    markAsRead,
    searchConversations,
    searchMessagesInConversation
};
