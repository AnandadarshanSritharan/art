const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendWelcomeEmail, sendOTPEmail } = require('../config/emailService');
const { createOTP, verifyOTP, deleteOTP, getRemainingTime } = require('../utils/otpService');

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

// @desc    Register a new user (or initiate artist registration with OTP)
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

    // If registering as artist, send OTP instead of creating account immediately
    if (isArtist) {
        const artistData = {
            name,
            email,
            password,
            bio: bio || '',
            phone: phone || '',
            address: address || '',
            country: country || '',
            termsAccepted: termsAccepted || false,
            termsVersion: termsVersion || null
        };

        // Create OTP and store artist data
        const otp = await createOTP(email, artistData);

        // Send OTP email
        await sendOTPEmail(name, email, otp);

        res.status(200).json({
            message: 'OTP sent to your email. Please verify to complete registration.',
            email: email,
            requiresOTP: true
        });
    } else {
        // Regular user registration (no OTP required)
        const user = await User.create({
            name,
            email,
            password,
            isArtist: false,
            bio: '',
        });

        if (user) {
            // Send welcome email (don't block registration if email fails)
            // sendWelcomeEmail(user.name, user.email).catch(error => {
            //     console.error('Failed to send welcome email, but user was created successfully:', error);
            // });

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                isArtist: user.isArtist,
                bio: user.bio,
                token: generateToken(user._id),
            });

            process.nextTick(() => {
                console.log(`[NEXT TICK] Sending welcome email to ${user.email}`);
                sendWelcomeEmail(user.name, user.email)
                    .then(() => console.log(`✅ Email sent to ${user.email}`))
                    .catch(err => console.error(`❌ Email error:`, err.message));
            });

        } else {
            res.status(400);
            throw new Error('Invalid user data');
        }
    }
});

// @desc    Verify artist OTP and create account
// @route   POST /api/auth/verify-artist-otp
// @access  Public
const verifyArtistOTP = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        res.status(400);
        throw new Error('Email and OTP are required');
    }

    // Verify OTP and get artist data
    const artistData = await verifyOTP(email, otp);

    if (!artistData) {
        res.status(400);
        throw new Error('Invalid or expired OTP');
    }

    // Check if user was created in the meantime
    const userExists = await User.findOne({ email });
    if (userExists) {
        await deleteOTP(email);
        res.status(400);
        throw new Error('User already exists');
    }

    // Create artist account
    const user = await User.create({
        name: artistData.name,
        email: artistData.email,
        password: artistData.password,
        isArtist: true,
        bio: artistData.bio,
        phone: artistData.phone,
        address: artistData.address,
        country: artistData.country,
        termsAccepted: artistData.termsAccepted,
        termsVersion: artistData.termsVersion
    });

    if (user) {
        // Delete OTP after successful registration
        await deleteOTP(email);

        // Send welcome email (don't block registration if email fails)
        sendWelcomeEmail(user.name, user.email).catch(error => {
            console.error('Failed to send welcome email, but user was created successfully:', error);
        });

        res.status(201).json({
            message: 'Artist account created successfully',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                isArtist: user.isArtist,
            }
        });
    } else {
        res.status(400);
        throw new Error('Failed to create artist account');
    }
});

// @desc    Resend OTP for artist registration
// @route   POST /api/auth/resend-artist-otp
// @access  Public
const resendArtistOTP = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        res.status(400);
        throw new Error('Email is required');
    }

    // Check if there's existing OTP data
    const OTP = require('../models/OTP');
    const existingOTP = await OTP.findOne({ email });

    if (!existingOTP) {
        res.status(404);
        throw new Error('No pending registration found for this email');
    }

    // Create new OTP with same artist data
    const otp = await createOTP(email, existingOTP.artistData);

    // Send OTP email
    await sendOTPEmail(existingOTP.artistData.name, email, otp);

    res.status(200).json({
        message: 'New OTP sent to your email',
        email: email
    });
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

// @desc    Delete user
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        if (user.isAdmin) {
            res.status(400);
            throw new Error('Cannot delete admin user');
        }
        await user.deleteOne();
        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

module.exports = {
    authUser,
    registerUser,
    verifyArtistOTP,
    resendArtistOTP,
    getUserProfile,
    updateUserProfile,
    getUsers,
    getSupportUser,
    getUserById,
    deleteUser
};
