const express = require('express');
const router = express.Router();
const { authUser, registerUser, getUserProfile, updateUserProfile, getUsers, getSupportUser, getUserById } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.get('/support', protect, getSupportUser);
router.get('/users', protect, admin, getUsers);
router.get('/users/:id', protect, getUserById);

module.exports = router;
