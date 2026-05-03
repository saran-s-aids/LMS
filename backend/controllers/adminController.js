const Category = require('../models/Category');
const Book = require('../models/Book');
const User = require('../models/User');
const IssuedBook = require('../models/IssuedBook');

// --- Category CRUD ---
const createCategory = async (req, res) => {
    const { name, description } = req.body;
    try {
        const category = await Category.create({ name, description });
        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({});
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (category) {
            category.name = req.body.name || category.name;
            category.description = req.body.description || category.description;
            const updatedCategory = await category.save();
            res.json(updatedCategory);
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (category) {
            await category.deleteOne();
            res.json({ message: 'Category removed' });
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Book CRUD ---
const createBook = async (req, res) => {
    const { title, author, category, isbn, totalCopies, description } = req.body;
    try {
        const book = await Book.create({ 
            title, 
            author, 
            category, 
            isbn, 
            description,
            totalCopies: Number(totalCopies),
            availableCopies: Number(totalCopies),
            issuedCopies: 0,
            availability: Number(totalCopies) > 0 ? 'Available' : 'Not Available',
            addedBy: req.user._id 
        });
        res.status(201).json(book);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getBooks = async (req, res) => {
    try {
        const books = await Book.find({}).populate('category', 'name');
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (book) {
            book.title = req.body.title || book.title;
            book.author = req.body.author || book.author;
            book.category = req.body.category || book.category;
            book.isbn = req.body.isbn || book.isbn;
            book.description = req.body.description || book.description;
            
            if (req.body.totalCopies !== undefined) {
                const diff = Number(req.body.totalCopies) - book.totalCopies;
                book.totalCopies = Number(req.body.totalCopies);
                book.availableCopies += diff;
                book.availability = book.availableCopies > 0 ? 'Available' : 'Not Available';
            }

            const updatedBook = await book.save();
            res.json(updatedBook);
        } else {
            res.status(404).json({ message: 'Book not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (book) {
            await book.deleteOne();
            res.json({ message: 'Book removed' });
        } else {
            res.status(404).json({ message: 'Book not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Book Issue & Return ---
const issueBook = async (req, res) => {
    const { studentId, bookId, returnDate } = req.body;
    try {
        const book = await Book.findById(bookId);
        if (!book || book.availability === 'Issued') {
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

        book.availability = 'Issued';
        await book.save();

        res.status(201).json(issuedBook);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const returnBook = async (req, res) => {
    try {
        const issuedRecord = await IssuedBook.findById(req.params.id);
        if (!issuedRecord) {
            return res.status(404).json({ message: 'Record not found' });
        }

        issuedRecord.status = 'Returned';
        issuedRecord.actualReturnDate = Date.now();
        await issuedRecord.save();

        const book = await Book.findById(issuedRecord.bookId);
        book.availability = 'Available';
        await book.save();

        res.json({ message: 'Book returned successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// --- Analytics ---
const getAnalytics = async (req, res) => {
    try {
        const totalStudents = await User.countDocuments({ role: 'Student' });
        const books = await Book.find({});
        
        const totalBooks = books.length;
        const totalCopies = books.reduce((acc, book) => acc + (book.totalCopies || 0), 0);
        const availableCopies = books.reduce((acc, book) => acc + (book.availableCopies || 0), 0);
        const issuedCopies = books.reduce((acc, book) => acc + (book.issuedCopies || 0), 0);

        const BookRequest = require('../models/BookRequest');
        const pendingRequests = await BookRequest.countDocuments({ status: 'Pending' });

        // Category-wise books
        const categories = await Category.find({});
        const categoryStats = await Promise.all(categories.map(async (cat) => {
            const count = await Book.countDocuments({ category: cat._id });
            return { name: cat.name, count };
        }));

        res.json({
            stats: {
                totalStudents,
                totalBooks,
                totalCopies,
                availableCopies,
                issuedCopies,
                pendingRequests
            },
            categoryStats
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Student Management ---
const getAllStudents = async (req, res) => {
    try {
        const students = await User.find({ role: 'Student' }).select('-password');
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getStudentById = async (req, res) => {
    try {
        const student = await User.findOne({ studentId: req.params.id }).select('-password');
        if (student) {
            const issuedBooks = await IssuedBook.find({ studentId: student._id }).populate('bookId');
            res.json({ student, issuedBooks });
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createCategory, getCategories, updateCategory, deleteCategory,
    createBook, getBooks, updateBook, deleteBook,
    issueBook, returnBook,
    getAnalytics,
    getAllStudents, getStudentById
};
