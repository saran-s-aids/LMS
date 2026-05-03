const IssuedBook = require('../models/IssuedBook');
const Book = require('../models/Book');
const User = require('../models/User');

// @desc    Issue a book directly
// @route   POST /api/issued
// @access  Private (Admin)
const issueBookDirectly = async (req, res) => {
    try {
        const { studentId, bookId, returnDate } = req.body;

        const book = await Book.findById(bookId);
        if (!book || book.availableCopies <= 0) {
            return res.status(400).json({ message: 'Book not available' });
        }

        const student = await User.findOne({ studentId });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const issuedBook = await IssuedBook.create({
            studentId: student._id,
            bookId,
            returnDate
        });

        // Update Book copies
        book.availableCopies -= 1;
        book.issuedCopies += 1;
        if (book.availableCopies === 0) {
            book.availability = 'Not Available';
        }
        await book.save();

        res.status(201).json(issuedBook);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all issued books
// @route   GET /api/issued
// @access  Private (Admin)
const getAllIssuedBooks = async (req, res) => {
    try {
        const issuedBooks = await IssuedBook.find({ status: 'Issued' })
            .populate('studentId', 'name studentId email')
            .populate('bookId')
            .sort('-issueDate');
        res.json(issuedBooks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get student issued books
// @route   GET /api/issued/student/:studentId
// @access  Private (Student/Admin)
const getStudentIssuedBooks = async (req, res) => {
    try {
        const issuedBooks = await IssuedBook.find({ studentId: req.params.studentId })
            .populate('bookId')
            .sort('-issueDate');
        res.json(issuedBooks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Return a book
// @route   PATCH /api/issued/:id/return
// @access  Private (Admin)
const returnBook = async (req, res) => {
    try {
        const issuedRecord = await IssuedBook.findById(req.params.id);
        if (!issuedRecord || issuedRecord.status === 'Returned') {
            return res.status(404).json({ message: 'Active record not found' });
        }

        issuedRecord.status = 'Returned';
        issuedRecord.actualReturnDate = Date.now();
        await issuedRecord.save();

        const book = await Book.findById(issuedRecord.bookId);
        if (book) {
            book.availableCopies += 1;
            book.issuedCopies -= 1;
            book.availability = 'Available';
            await book.save();
        }

        res.json({ message: 'Book returned successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    issueBookDirectly,
    getAllIssuedBooks,
    getStudentIssuedBooks,
    returnBook
};
