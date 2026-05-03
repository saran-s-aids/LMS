const express = require('express');
const router = express.Router();
const { 
    startConversation, 
    getUserConversations, 
    getMessages, 
    sendMessage 
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/conversations/marketplace', startConversation);
router.get('/conversations/user/:userId', getUserConversations);
router.get('/messages/:conversationId', getMessages);
router.post('/messages', sendMessage);

module.exports = router;
