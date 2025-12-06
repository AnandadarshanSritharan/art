const mongoose = require('mongoose');

const termsAndConditionsSchema = mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    version: {
        type: Number,
        required: true,
        default: 1
    },
    isActive: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Ensure only one active version at a time
termsAndConditionsSchema.pre('save', async function (next) {
    if (this.isActive) {
        await mongoose.model('TermsAndConditions').updateMany(
            { _id: { $ne: this._id } },
            { isActive: false }
        );
    }
    next();
});

const TermsAndConditions = mongoose.model('TermsAndConditions', termsAndConditionsSchema);

module.exports = TermsAndConditions;
