const express = require('express');
const router = express.Router();
const {
    getConversations,
    getMessages,
    sendMessage,
    markAsRead,
    searchConversations,
    searchMessagesInConversation
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.route('/conversations').get(protect, getConversations);
router.route('/search').get(protect, searchConversations);
router.route('/:conversationId').get(protect, getMessages);
router.route('/:conversationId/read').put(protect, markAsRead);
router.route('/:conversationId/search').get(protect, searchMessagesInConversation);
router.route('/').post(protect, sendMessage);

module.exports = router;
