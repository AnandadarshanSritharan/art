const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const updateAdminToArtist = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Find admin user
        const admin = await User.findOne({ email: 'admin@artplatform.com' });

        if (!admin) {
            console.log('Admin user not found!');
            process.exit(1);
        }

        // Update admin to also be an artist
        admin.isArtist = true;
        admin.bio = 'Platform Administrator and Featured Artist';
        await admin.save();

        console.log('Admin user updated successfully!');
        console.log('Admin is now also an artist and can access the Artist Dashboard');

        process.exit(0);
    } catch (error) {
        console.error('Error updating admin user:', error);
        process.exit(1);
    }
};

updateAdminToArtist();
