const express = require('express');
const router = express.Router();
const { getArtworks, getArtworkById, createArtwork, deleteArtwork, updateArtwork, createArtworkReview, incrementArtworkViews } = require('../controllers/artworkController');
const { protect, admin, artist } = require('../middleware/authMiddleware');

router.route('/').get(getArtworks).post(protect, artist, createArtwork);
router.route('/:id').get(getArtworkById).delete(protect, artist, deleteArtwork).put(protect, artist, updateArtwork);
router.route('/:id/reviews').post(protect, createArtworkReview);
router.route('/:id/view').put(incrementArtworkViews);

module.exports = router;
