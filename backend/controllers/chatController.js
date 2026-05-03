const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

// @desc    Start or get conversation for a marketplace item
// @route   POST /api/conversations/marketplace
const startConversation = async (req, res) => {
    try {
        const { sellerId, marketplaceItemId } = req.body;
        const buyerId = req.user._id;

        if (sellerId === buyerId.toString()) {
            return res.status(400).json({ message: "You cannot start a conversation with yourself." });
        }

        let conversation = await Conversation.findOne({
            buyerId,
            sellerId,
            marketplaceItemId
        });

        if (!conversation) {
            conversation = await Conversation.create({
                buyerId,
                sellerId,
                marketplaceItemId
            });
        }

        res.status(201).json(conversation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user conversations
// @route   GET /api/conversations/user/:userId
const getUserConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find({
            $or: [{ buyerId: req.params.userId }, { sellerId: req.params.userId }]
        })
        .populate('buyerId', 'name studentId')
        .populate('sellerId', 'name studentId')
        .populate('marketplaceItemId', 'title image price')
        .sort('-createdAt');

        res.json(conversations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get messages for a conversation
// @route   GET /api/messages/:conversationId
const getMessages = async (req, res) => {
    try {
        const messages = await Message.find({ conversationId: req.params.conversationId })
            .sort('timestamp');
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Send a message
// @route   POST /api/messages
const sendMessage = async (req, res) => {
    try {
        const { conversationId, message } = req.body;
        const senderId = req.user._id;

        const newMessage = await Message.create({
            conversationId,
            senderId,
            message
        });

        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    startConversation, 
    getUserConversations, 
    getMessages, 
    sendMessage 
};
