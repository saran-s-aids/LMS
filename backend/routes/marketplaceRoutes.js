const express = require('express');
const router = express.Router();
const { createListing, getListings, getMyListings, updateListingStatus, deleteListing } = require('../controllers/marketplaceController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.route('/').get(getListings).post(upload.single('image'), createListing);
router.get('/my', getMyListings);
router.put('/:id/status', updateListingStatus);
router.delete('/:id', deleteListing);

module.exports = router;
