const express = require('express');
const router = express.Router();
const {
    createRequest,
    getStudentRequests,
    getAllRequests,
    approveRequest,
    rejectRequest,
    issueBookFromRequest
} = require('../controllers/bookRequestController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/', protect, createRequest);
router.get('/student/:studentId', protect, getStudentRequests);
router.get('/admin', protect, adminOnly, getAllRequests);
router.patch('/:id/approve', protect, adminOnly, approveRequest);
router.patch('/:id/reject', protect, adminOnly, rejectRequest);
router.patch('/:id/issue', protect, adminOnly, issueBookFromRequest);

module.exports = router;
