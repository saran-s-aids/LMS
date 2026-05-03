const mongoose = require('mongoose');

const issuedBookSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    issueDate: { type: Date, default: Date.now },
    returnDate: { type: Date },
    actualReturnDate: { type: Date },
    status: { type: String, enum: ['Issued', 'Returned'], default: 'Issued' }
});

module.exports = mongoose.model('IssuedBook', issuedBookSchema);
