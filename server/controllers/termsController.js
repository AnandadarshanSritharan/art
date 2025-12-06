const asyncHandler = require('express-async-handler');
const TermsAndConditions = require('../models/TermsAndConditions');

// @desc    Get active terms and conditions
// @route   GET /api/terms
// @access  Public
const getActiveTerms = asyncHandler(async (req, res) => {
    const terms = await TermsAndConditions.findOne({ isActive: true });

    if (terms) {
        res.json(terms);
    } else {
        res.status(404);
        throw new Error('No active terms and conditions found');
    }
});

// @desc    Get all terms and conditions versions
// @route   GET /api/terms/all
// @access  Private/Admin
const getAllTerms = asyncHandler(async (req, res) => {
    const terms = await TermsAndConditions.find({})
        .populate('createdBy', 'name email')
        .sort({ version: -1 });
    res.json(terms);
});

// @desc    Create new terms and conditions
// @route   POST /api/terms
// @access  Private/Admin
const createTerms = asyncHandler(async (req, res) => {
    const { content } = req.body;

    if (!content) {
        res.status(400);
        throw new Error('Content is required');
    }

    // Get the latest version number
    const latestTerms = await TermsAndConditions.findOne().sort({ version: -1 });
    const newVersion = latestTerms ? latestTerms.version + 1 : 1;

    const terms = await TermsAndConditions.create({
        content,
        version: newVersion,
        isActive: false,
        createdBy: req.user._id
    });

    res.status(201).json(terms);
});

// @desc    Update terms and conditions
// @route   PUT /api/terms/:id
// @access  Private/Admin
const updateTerms = asyncHandler(async (req, res) => {
    const { content } = req.body;

    const terms = await TermsAndConditions.findById(req.params.id);

    if (!terms) {
        res.status(404);
        throw new Error('Terms and conditions not found');
    }

    terms.content = content || terms.content;
    const updatedTerms = await terms.save();

    res.json(updatedTerms);
});

// @desc    Set terms as active
// @route   PUT /api/terms/:id/activate
// @access  Private/Admin
const setActiveTerms = asyncHandler(async (req, res) => {
    const terms = await TermsAndConditions.findById(req.params.id);

    if (!terms) {
        res.status(404);
        throw new Error('Terms and conditions not found');
    }

    // Deactivate all other versions
    await TermsAndConditions.updateMany({}, { isActive: false });

    // Activate this version
    terms.isActive = true;
    await terms.save();

    res.json({ message: 'Terms and conditions activated', terms });
});

module.exports = {
    getActiveTerms,
    getAllTerms,
    createTerms,
    updateTerms,
    setActiveTerms
};
