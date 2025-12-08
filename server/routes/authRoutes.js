const express = require('express');
const router = express.Router();
const { authUser, registerUser, verifyArtistOTP, resendArtistOTP, getUserProfile, updateUserProfile, getUsers, getSupportUser, getUserById, deleteUser } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/verify-artist-otp', verifyArtistOTP);
router.post('/resend-artist-otp', resendArtistOTP);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.get('/support', protect, getSupportUser);
router.get('/users', protect, admin, getUsers);
router.get('/users/:id', protect, getUserById);
router.delete('/users/:id', protect, admin, deleteUser);

module.exports = router;
