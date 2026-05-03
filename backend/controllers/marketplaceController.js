const MarketplaceItem = require('../models/MarketplaceItem');

const createListing = async (req, res) => {
    const { title, price, description, category } = req.body;
    const image = req.file ? req.file.path : '';

    try {
        const item = await MarketplaceItem.create({
            sellerId: req.user._id,
            title,
            price,
            description,
            category,
            image
        });
        res.status(201).json(item);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getListings = async (req, res) => {
    const { keyword } = req.query;
    let query = { status: 'Available' };

    if (keyword) {
        query.title = { $regex: keyword, $options: 'i' };
    }

    try {
        const items = await MarketplaceItem.find(query).populate('sellerId', 'name studentId');
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMyListings = async (req, res) => {
    try {
        const items = await MarketplaceItem.find({ sellerId: req.user._id });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateListingStatus = async (req, res) => {
    try {
        const item = await MarketplaceItem.findById(req.params.id);
        if (item && item.sellerId.toString() === req.user._id.toString()) {
            item.status = req.body.status || item.status;
            await item.save();
            res.json(item);
        } else {
            res.status(404).json({ message: 'Item not found or unauthorized' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteListing = async (req, res) => {
    try {
        const item = await MarketplaceItem.findById(req.params.id);
        if (item && (item.sellerId.toString() === req.user._id.toString() || req.user.role === 'Admin')) {
            await item.deleteOne();
            res.json({ message: 'Listing removed' });
        } else {
            res.status(404).json({ message: 'Item not found or unauthorized' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createListing, getListings, getMyListings, updateListingStatus, deleteListing };
