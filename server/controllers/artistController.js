const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Artwork = require('../models/Artwork');

// @desc    Get all artists with pagination and search
// @route   GET /api/artists?page=1&limit=20&search=name
// @access  Public
const getArtists = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';

    const query = { isArtist: true, isAdmin: false };
    if (search) {
        query.name = { $regex: search, $options: 'i' };
    }

    const total = await User.countDocuments(query);
    const artists = await User.find(query)
        .select('-password')
        .limit(limit)
        .skip((page - 1) * limit)
        .sort({ name: 1 });

    res.json({
        artists,
        page,
        pages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
    });
});

// @desc    Get artist by ID
// @route   GET /api/artists/:id
// @access  Public
const getArtistById = asyncHandler(async (req, res) => {
    const artist = await User.findById(req.params.id).select('-password');

    if (artist && artist.isArtist) {
        res.json(artist);
    } else {
        res.status(404);
        throw new Error('Artist not found');
    }
});

// @desc    Get artworks by artist
// @route   GET /api/artists/:id/artworks
// @access  Public
const getArtistArtworks = asyncHandler(async (req, res) => {
    const artworks = await Artwork.find({ artist: req.params.id })
        .populate('category', 'name')
        .populate('artist', 'name profileImage');

    res.json(artworks);
});

// @desc    Update artist profile
// @route   PUT /api/artists/profile
// @access  Private (Artist only)
const updateArtistProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user && user.isArtist) {
        user.bio = req.body.bio || user.bio;
        user.profileImage = req.body.profileImage || user.profileImage;
        user.socialLinks = req.body.socialLinks || user.socialLinks;
        user.phone = req.body.phone || user.phone;
        user.address = req.body.address || user.address;
        user.country = req.body.country || user.country;

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
            isArtist: updatedUser.isArtist,
            bio: updatedUser.bio,
            profileImage: updatedUser.profileImage,
            socialLinks: updatedUser.socialLinks,
            phone: updatedUser.phone,
            address: updatedUser.address,
            country: updatedUser.country,
        });
    } else {
        res.status(404);
        throw new Error('User not found or not an artist');
    }
});

module.exports = {
    getArtists,
    getArtistById,
    getArtistArtworks,
    updateArtistProfile,
};
