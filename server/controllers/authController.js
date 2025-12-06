const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            isArtist: user.isArtist,
            bio: user.bio,
            profileImage: user.profileImage,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, isArtist, bio, phone, address, country, termsAccepted, termsVersion } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // For artists, require terms acceptance
    if (isArtist && !termsAccepted) {
        res.status(400);
        throw new Error('You must accept the terms and conditions to register as an artist');
    }

    const user = await User.create({
        name,
        email,
        password,
        isArtist: isArtist || false,
        bio: bio || '',
        phone: phone || '',
        address: address || '',
        country: country || '',
        termsAccepted: termsAccepted || false,
        termsVersion: termsVersion || null
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            isArtist: user.isArtist,
            bio: user.bio,
            phone: user.phone,
            address: user.address,
            country: user.country,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            isArtist: user.isArtist,
            bio: user.bio,
            profileImage: user.profileImage,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({});
    res.json(users);
});

// @desc    Get support user (admin)
// @route   GET /api/auth/support
// @access  Private
const getSupportUser = asyncHandler(async (req, res) => {
    // Find the first admin user
    const admin = await User.findOne({ isAdmin: true }).select('_id name profileImage');

    if (admin) {
        res.json(admin);
    } else {
        res.status(404);
        throw new Error('Support unavailable');
    }
});

// @desc    Get user by ID (public info)
// @route   GET /api/auth/users/:id
// @access  Private
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('_id name profileImage isArtist');

    if (user) {
        res.json(user);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.profileImage = req.body.profileImage || user.profileImage;

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
            isArtist: updatedUser.isArtist,
            bio: updatedUser.bio,
            profileImage: updatedUser.profileImage,
            token: generateToken(updatedUser._id),
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

module.exports = {
    authUser,
    registerUser,
    getUserProfile,
    updateUserProfile,
    getUsers,
    getSupportUser,
    getUserById
};
