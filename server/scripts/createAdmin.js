const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createAdminUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Check if admin already exists
        const adminExists = await User.findOne({ email: 'admin@artplatform.com' });

        if (adminExists) {
            console.log('Admin user already exists!');
            console.log('Email:', adminExists.email);
            process.exit(0);
        }

        // Create admin user
        const admin = await User.create({
            name: 'Admin',
            email: 'admin@artplatform.com',
            password: 'admin123', // Change this to a secure password
            isAdmin: true,
        });

        console.log('Admin user created successfully!');
        console.log('Email:', admin.email);
        console.log('Password: admin123');
        console.log('\n⚠️  IMPORTANT: Change the password after first login!');

        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
};

createAdminUser();
