const mongoose = require('mongoose');
const dotenv = require('dotenv');
const TermsAndConditions = require('../models/TermsAndConditions');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const seedTerms = async () => {
    await connectDB();

    try {
        // Check if active terms exist
        const activeTerms = await TermsAndConditions.findOne({ isActive: true });
        if (activeTerms) {
            console.log('Active terms already exist.');
            process.exit();
        }

        // Create default terms
        const defaultTerms = {
            content: `
# Terms and Conditions for Artists

## 1. Introduction
Welcome to ArtSpace. By registering as an artist, you agree to these terms.

## 2. Artist Obligations
- You must be the original creator of the artworks you list.
- You agree to fulfill orders promptly.
- You represent and warrant that your work does not infringe on any third-party rights.

## 3. Fees and Payments
- ArtSpace charges a commission on each sale.
- Payments are processed securely via Stripe.

## 4. Content Guidelines
- No offensive or illegal content is allowed.
- We reserve the right to remove any listing.

## 5. Termination
- We may terminate your account for violations of these terms.
            `,
            version: 1,
            isActive: true,
            // Assuming we might not have a user ID to link to, or we can try to find an admin
            // For simplicity in seeding, we might omit createdBy or find the first user
        };

        // Try to find an admin user to assign as creator
        // This requires the User model
        const User = require('../models/User');
        const adminUser = await User.findOne({ isAdmin: true });

        if (adminUser) {
            defaultTerms.createdBy = adminUser._id;
        }

        await TermsAndConditions.create(defaultTerms);
        console.log('Default terms and conditions created and activated.');
    } catch (error) {
        console.error(`Error: ${error.message}`);
    } finally {
        process.exit();
    }
};

seedTerms();
