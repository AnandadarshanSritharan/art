const express = require('express');
const router = express.Router();
const {
    getArtists,
    getArtistById,
    getArtistArtworks,
    updateArtistProfile,
} = require('../controllers/artistController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(getArtists);
router.route('/profile').put(protect, updateArtistProfile);
router.route('/:id').get(getArtistById);
router.route('/:id/artworks').get(getArtistArtworks);

module.exports = router;
