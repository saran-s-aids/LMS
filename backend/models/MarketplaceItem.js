const mongoose = require('mongoose');

const marketplaceItemSchema = new mongoose.Schema({
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    image: { type: String }, // Path to uploaded image
    category: { type: String },
    status: { type: String, enum: ['Available', 'Sold'], default: 'Available' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MarketplaceItem', marketplaceItemSchema);
