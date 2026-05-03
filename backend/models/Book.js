const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    description: { type: String },
    isbn: { type: String },
    totalCopies: { type: Number, default: 1 },
    availableCopies: { type: Number, default: 1 },
    issuedCopies: { type: Number, default: 0 },
    availability: { type: String, enum: ['Available', 'Not Available'], default: 'Available' },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Book', bookSchema);
