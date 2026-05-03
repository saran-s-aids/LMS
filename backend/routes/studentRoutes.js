const express = require('express');
const router = express.Router();
const { getLibraryBooks, getMyIssuedBooks, getNotifications } = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/books', getLibraryBooks);
router.get('/my-books', getMyIssuedBooks);
router.get('/notifications', getNotifications);

module.exports = router;
