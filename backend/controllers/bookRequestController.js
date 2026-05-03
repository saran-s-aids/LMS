const BookRequest = require('../models/BookRequest');
const Book = require('../models/Book');
const IssuedBook = require('../models/IssuedBook');

// @desc    Create a book request
// @route   POST /api/requests
// @access  Private (Student)
const createRequest = async (req, res) => {
    try {
        const { bookId } = req.body;
        const studentId = req.user._id;

        // Check if student already has a pending or issued request for this book
        const existingRequest = await BookRequest.findOne({
            studentId,
            bookId,
            status: { $in: ['Pending', 'Approved', 'Issued'] }
        });

        if (existingRequest) {
            return res.status(400).json({ message: 'You already have an active request or this book is already issued to you.' });
        }

        const request = await BookRequest.create({
            studentId,
            bookId
        });

        res.status(201).json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get student requests
// @route   GET /api/requests/student/:studentId
// @access  Private (Student)
const getStudentRequests = async (req, res) => {
    try {
        const requests = await BookRequest.find({ studentId: req.params.studentId })
            .populate('bookId')
            .sort('-requestedAt');
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all requests (Admin)
// @route   GET /api/requests/admin
// @access  Private (Admin)
const getAllRequests = async (req, res) => {
    try {
        const requests = await BookRequest.find()
            .populate('studentId', 'name studentId email')
            .populate('bookId')
            .sort('-requestedAt');
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve request
// @route   PATCH /api/requests/:id/approve
// @access  Private (Admin)
const approveRequest = async (req, res) => {
    try {
        const request = await BookRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ message: 'Request not found' });

        request.status = 'Approved';
        request.updatedAt = Date.now();
        await request.save();

        res.json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reject request
// @route   PATCH /api/requests/:id/reject
// @access  Private (Admin)
const rejectRequest = async (req, res) => {
    try {
        const request = await BookRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ message: 'Request not found' });

        request.status = 'Rejected';
        request.updatedAt = Date.now();
        await request.save();

        res.json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Issue book from request
// @route   PATCH /api/requests/:id/issue
// @access  Private (Admin)
const issueBookFromRequest = async (req, res) => {
    try {
        const request = await BookRequest.findById(req.params.id).populate('bookId');
        if (!request) return res.status(404).json({ message: 'Request not found' });

        const book = await Book.findById(request.bookId._id);
        if (book.availableCopies <= 0) {
            return res.status(400).json({ message: 'No copies available for this book' });
        }

        // Create IssuedBook record
        const issuedBook = await IssuedBook.create({
            studentId: request.studentId,
            bookId: request.bookId,
            returnDate: req.body.returnDate
        });

        // Update Book copies
        book.availableCopies -= 1;
        book.issuedCopies += 1;
        if (book.availableCopies === 0) {
            book.availability = 'Not Available';
        }
        await book.save();

        // Update Request status
        request.status = 'Issued';
        request.updatedAt = Date.now();
        await request.save();

        res.json({ request, issuedBook });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createRequest,
    getStudentRequests,
    getAllRequests,
    approveRequest,
    rejectRequest,
    issueBookFromRequest
};
