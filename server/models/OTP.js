const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    otp: {
        type: String,
        required: true,
    },
    artistData: {
        type: Object,
        required: true,
    },
    verified: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 }, // TTL index - auto-delete when expiresAt is reached
    },
});

// Index for faster lookups
otpSchema.index({ email: 1, otp: 1 });

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;
