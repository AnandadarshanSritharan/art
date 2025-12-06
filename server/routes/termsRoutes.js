const express = require('express');
const router = express.Router();
const {
    getActiveTerms,
    getAllTerms,
    createTerms,
    updateTerms,
    setActiveTerms
} = require('../controllers/termsController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(getActiveTerms).post(protect, admin, createTerms);
router.route('/all').get(protect, admin, getAllTerms);
router.route('/:id').put(protect, admin, updateTerms);
router.route('/:id/activate').put(protect, admin, setActiveTerms);

module.exports = router;
