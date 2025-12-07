const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { storage } = require('../config/cloudinaryConfig');

// Configure storage
// storage is imported from cloudinaryConfig

// File filter to only accept images
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
});

// @desc    Upload image
// @route   POST /api/upload
// @access  Private/Admin
router.post('/', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    // Return the file path
    res.json({
        message: 'Image uploaded successfully',
        imagePath: req.file.path
    });
});

// @desc    Upload multiple images
// @route   POST /api/upload/multiple
// @access  Private/Admin
router.post('/multiple', upload.array('images', 5), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
    }

    const imagePaths = req.files.map(file => file.path);

    res.json({
        message: 'Images uploaded successfully',
        imagePaths: imagePaths
    });
});

module.exports = router;
