const Book = require('../models/Book');
const IssuedBook = require('../models/IssuedBook');
const User = require('../models/User');
const Message = require('../models/Message');

// @desc    Get all books with search and filter
// @route   GET /api/student/books
const getLibraryBooks = async (req, res) => {
    const { keyword, category } = req.query;
    let query = {};

    if (keyword) {
        query.title = { $regex: keyword, $options: 'i' };
    }

    if (category) {
        query.category = category;
    }

    try {
        const books = await Book.find(query).populate('category', 'name');
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my issued books
// @route   GET /api/student/my-books
const getMyIssuedBooks = async (req, res) => {
    try {
        const issuedBooks = await IssuedBook.find({ studentId: req.user._id, status: 'Issued' }).populate('bookId');
        res.json(issuedBooks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get student notifications
// @route   GET /api/student/notifications
const getNotifications = async (req, res) => {
    try {
        const notifications = [];

        // 1. Check for messages
        const unreadMessages = await Message.find({ receiverId: req.user._id, isRead: false })
            .sort({ timestamp: -1 })
            .limit(5)
            .populate('senderId', 'name');
        
        unreadMessages.forEach(msg => {
            notifications.push({
                type: 'message',
                title: 'New Message',
                message: `You have a new message from ${msg.senderId?.name || 'Admin'}`,
                date: msg.timestamp
            });
        });

        // 2. Check for due books
        const issuedBooks = await IssuedBook.find({ studentId: req.user._id, status: 'Issued' }).populate('bookId');
        const today = new Date();
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(today.getDate() + 3);

        issuedBooks.forEach(record => {
            const dueDate = new Date(record.returnDate);
            if (dueDate <= threeDaysFromNow) {
                const diffTime = dueDate - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                notifications.push({
                    type: 'due',
                    title: 'Book Due Reminder',
                    message: `"${record.bookId?.title}" is due ${diffDays <= 0 ? 'today or overdue!' : `in ${diffDays} days.`}`,
                    date: record.returnDate
                });
            }
        });

        // Sort by date (newest first)
        notifications.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getLibraryBooks, getMyIssuedBooks, getNotifications };
