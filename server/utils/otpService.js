const OTP = require('../models/OTP');

/**
 * Generate a random 6-digit OTP
 * @returns {string} 6-digit OTP code
 */
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Create and store OTP with artist registration data
 * @param {string} email - Artist's email
 * @param {object} artistData - Artist registration data
 * @returns {Promise<string>} Generated OTP code
 */
const createOTP = async (email, artistData) => {
    try {
        // Normalize email to lowercase
        const normalizedEmail = email.trim().toLowerCase();

        // Delete any existing OTP for this email
        await OTP.deleteMany({ email: normalizedEmail });

        // Generate new OTP
        const otp = generateOTP();

        // Set expiration to 15 minutes from now
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        // Create OTP record
        await OTP.create({
            email: normalizedEmail,
            otp,
            artistData,
            expiresAt,
        });

        console.log(`✅ OTP created for ${normalizedEmail}: ${otp} (expires at ${expiresAt.toLocaleTimeString()})`);
        return otp;
    } catch (error) {
        console.error('Error creating OTP:', error);
        throw new Error('Failed to create OTP');
    }
};

/**
 * Verify OTP code
 * @param {string} email - Artist's email
 * @param {string} otp - OTP code to verify
 * @returns {Promise<object>} Artist data if valid, null if invalid
 */
const verifyOTP = async (email, otp) => {
    try {
        // Trim whitespace from email and OTP
        const trimmedEmail = email.trim().toLowerCase();
        const trimmedOtp = otp.trim();

        console.log(`🔍 Verifying OTP for ${trimmedEmail}: "${trimmedOtp}"`);

        const otpRecord = await OTP.findOne({ email: trimmedEmail, otp: trimmedOtp });

        if (!otpRecord) {
            console.log(`❌ Invalid OTP for ${trimmedEmail}. OTP provided: "${trimmedOtp}"`);
            return null;
        }

        // Check if OTP has expired
        if (new Date() > otpRecord.expiresAt) {
            console.log(`❌ Expired OTP for ${trimmedEmail}`);
            await OTP.deleteOne({ _id: otpRecord._id });
            return null;
        }

        // Mark as verified
        otpRecord.verified = true;
        await otpRecord.save();

        console.log(`✅ OTP verified successfully for ${trimmedEmail}`);
        return otpRecord.artistData;
    } catch (error) {
        console.error('Error verifying OTP:', error);
        throw new Error('Failed to verify OTP');
    }
};

/**
 * Delete OTP after successful verification
 * @param {string} email - Artist's email
 */
const deleteOTP = async (email) => {
    try {
        await OTP.deleteMany({ email });
        console.log(`🗑️ OTP deleted for ${email}`);
    } catch (error) {
        console.error('Error deleting OTP:', error);
    }
};

/**
 * Get remaining time for OTP
 * @param {string} email - Artist's email
 * @returns {Promise<number>} Remaining seconds, or 0 if expired/not found
 */
const getRemainingTime = async (email) => {
    try {
        const otpRecord = await OTP.findOne({ email });
        if (!otpRecord) return 0;

        const remaining = Math.max(0, Math.floor((otpRecord.expiresAt - new Date()) / 1000));
        return remaining;
    } catch (error) {
        console.error('Error getting remaining time:', error);
        return 0;
    }
};

module.exports = {
    generateOTP,
    createOTP,
    verifyOTP,
    deleteOTP,
    getRemainingTime,
};
