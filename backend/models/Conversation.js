const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    marketplaceItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MarketplaceItem', required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Conversation', conversationSchema);
