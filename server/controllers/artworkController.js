const asyncHandler = require('express-async-handler');
const Artwork = require('../models/Artwork');

// @desc    Fetch all artworks with pagination and filters
// @route   GET /api/artworks?page=1&limit=24&search=&category=&availability=&minPrice=&maxPrice=
// @access  Public
const getArtworks = asyncHandler(async (req, res) => {
    console.log('getArtworks query:', req.query);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 24;
    const search = req.query.search || '';
    const category = req.query.category;
    const availability = req.query.availability;

    // Build query
    const query = {};

    // Search by artwork title, artist name, OR category name
    if (search) {
        const User = require('../models/User');
        const Category = require('../models/Category');

        const artists = await User.find({
            name: { $regex: search, $options: 'i' },
            isArtist: true
        }).select('_id');

        const categories = await Category.find({
            name: { $regex: search, $options: 'i' }
        }).select('_id');

        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { artist: { $in: artists.map(a => a._id) } },
            { category: { $in: categories.map(c => c._id) } }
        ];
    }

    // Category filter
    if (category) {
        if (Array.isArray(category)) {
            query.category = { $in: category };
        } else {
            query.category = category;
        }
    }

    // Availability filter
    if (availability === 'in-stock') {
        query.stock = { $gt: 0 };
    } else if (availability === 'sold') {
        query.stock = 0;
    }

    // Price range filter - only apply if explicitly provided
    if (req.query.minPrice !== undefined || req.query.maxPrice !== undefined) {
        const minPrice = parseFloat(req.query.minPrice) || 0;
        const maxPrice = parseFloat(req.query.maxPrice) || Number.MAX_SAFE_INTEGER;
        query.price = { $gte: minPrice, $lte: maxPrice };
    }

    const total = await Artwork.countDocuments(query);
    const artworks = await Artwork.find(query)
        .populate('category', 'name')
        .populate('artist', 'name profileImage')
        .limit(limit)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

    res.json({
        artworks,
        page,
        pages: Math.ceil(total / limit),
        total,
        hasMore: page < Math.ceil(total / limit)
    });
});

const getArtworkById = asyncHandler(async (req, res) => {
    const artwork = await Artwork.findById(req.params.id)
        .populate('category', 'name')
        .populate('artist', 'name');

    if (artwork) {
        res.json(artwork);
    } else {
        res.status(404);
        throw new Error('Artwork not found');
    }
});

// @desc    Create an artwork
// @route   POST /api/artworks
// @access  Private/Admin/Artist
const createArtwork = asyncHandler(async (req, res) => {
    const { title, description, price, category, image, images, dimensions, medium, stock, featured } = req.body;

    // If admin, allow specifying artist, otherwise default to logged in user
    let artistId = req.user._id;
    if (req.user.isAdmin && req.body.artist) {
        artistId = req.body.artist;
    }

    const artwork = new Artwork({
        title,
        description,
        artist: artistId,
        price,
        category,
        image,
        images: images || [image], // Default to single image if array not provided
        dimensions,
        medium,
        stock,
        featured,
    });

    const createdArtwork = await artwork.save();
    res.status(201).json(createdArtwork);
});

// @desc    Delete an artwork
// @route   DELETE /api/artworks/:id
// @access  Private/Admin/Artist
const deleteArtwork = asyncHandler(async (req, res) => {
    const artwork = await Artwork.findById(req.params.id);

    if (artwork) {
        // Check if user is admin or the artist of the artwork
        if (req.user.isAdmin || artwork.artist.toString() === req.user._id.toString()) {
            await artwork.deleteOne();
            res.json({ message: 'Artwork removed' });
        } else {
            res.status(401);
            throw new Error('Not authorized to delete this artwork');
        }
    } else {
        res.status(404);
        throw new Error('Artwork not found');
    }
});

// @desc    Update an artwork
// @route   PUT /api/artworks/:id
// @access  Private/Admin/Artist
const updateArtwork = asyncHandler(async (req, res) => {
    const { title, description, artist, price, category, image, dimensions, medium, stock, featured } = req.body;

    const artwork = await Artwork.findById(req.params.id);

    if (artwork) {
        // Check if user is admin or the artist of the artwork
        if (req.user.isAdmin || artwork.artist.toString() === req.user._id.toString()) {
            artwork.title = title || artwork.title;
            artwork.description = description || artwork.description;
            // Only admin can change the artist
            if (req.user.isAdmin && artist) {
                artwork.artist = artist;
            }
            artwork.price = price || artwork.price;
            artwork.category = category || artwork.category;
            artwork.image = image || artwork.image;
            if (req.body.images) {
                artwork.images = req.body.images;
            }
            artwork.dimensions = dimensions || artwork.dimensions;
            artwork.medium = medium || artwork.medium;
            artwork.stock = stock !== undefined ? stock : artwork.stock;
            artwork.featured = featured !== undefined ? featured : artwork.featured;

            const updatedArtwork = await artwork.save();
            res.json(updatedArtwork);
        } else {
            res.status(401);
            throw new Error('Not authorized to update this artwork');
        }
    } else {
        res.status(404);
        throw new Error('Artwork not found');
    }
});

// @desc    Create new review
// @route   POST /api/artworks/:id/reviews
// @access  Private
const createArtworkReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;
    const artwork = await Artwork.findById(req.params.id);

    if (artwork) {
        const alreadyReviewed = artwork.reviews.find(
            (r) => r.user.toString() === req.user._id.toString()
        );

        if (alreadyReviewed) {
            res.status(400);
            throw new Error('Artwork already reviewed');
        }

        const review = {
            name: req.user.name,
            rating: Number(rating),
            comment,
            user: req.user._id,
        };

        artwork.reviews.push(review);
        artwork.numReviews = artwork.reviews.length;
        artwork.rating =
            artwork.reviews.reduce((acc, item) => item.rating + acc, 0) /
            artwork.reviews.length;

        await artwork.save();
        res.status(201).json({ message: 'Review added' });
    }
});

// @desc    Increment artwork views
// @route   PUT /api/artworks/:id/view
// @access  Public
const incrementArtworkViews = asyncHandler(async (req, res) => {
    const artwork = await Artwork.findById(req.params.id);

    if (artwork) {
        artwork.views += 1;
        await artwork.save();
        res.json({ views: artwork.views });
    } else {
        res.status(404);
        throw new Error('Artwork not found');
    }
});

module.exports = { getArtworks, getArtworkById, createArtwork, deleteArtwork, updateArtwork, createArtworkReview, incrementArtworkViews };
