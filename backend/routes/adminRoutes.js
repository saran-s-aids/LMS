const express = require('express');
const router = express.Router();
const {
    createCategory, getCategories, updateCategory, deleteCategory,
    createBook, getBooks, updateBook, deleteBook,
    issueBook, returnBook,
    getAnalytics,
    getAllStudents, getStudentById
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// All routes here are protected and admin only
router.use(protect);
router.use(adminOnly);

router.get('/analytics', getAnalytics);

router.route('/categories').get(getCategories).post(createCategory);
router.route('/categories/:id').put(updateCategory).delete(deleteCategory);

// Book routes — coverImage is an optional file upload field
router.route('/books').get(getBooks).post(upload.single('coverImage'), createBook);
router.route('/books/:id').put(upload.single('coverImage'), updateBook).delete(deleteBook);

router.post('/books/issue', issueBook);
router.put('/books/return/:id', returnBook);

router.get('/students', getAllStudents);
router.get('/students/:id', getStudentById);

module.exports = router;

