const mongoose = require('mongoose');

const bookRequestSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    status: { 
        type: String, 
        enum: ['Pending', 'Approved', 'Rejected', 'Issued'], 
        default: 'Pending' 
    },
    requestedAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BookRequest', bookRequestSchema);
