const express = require('express');
const router = express.Router();
const {
    issueBookDirectly,
    getAllIssuedBooks,
    getStudentIssuedBooks,
    returnBook
} = require('../controllers/issuedBookController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/', protect, adminOnly, issueBookDirectly);
router.get('/', protect, adminOnly, getAllIssuedBooks);
router.get('/student/:studentId', protect, getStudentIssuedBooks);
router.patch('/:id/return', protect, adminOnly, returnBook);

module.exports = router;
