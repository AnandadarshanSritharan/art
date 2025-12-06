const mongoose = require('mongoose');
const Category = require('../models/Category');
require('dotenv').config();

const listCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB\n');

        const categories = await Category.find({});

        if (categories.length === 0) {
            console.log('❌ No categories found in database!');
            console.log('Run: node scripts/seedCategories.js');
        } else {
            console.log(`✅ Found ${categories.length} categories:\n`);
            categories.forEach((cat, index) => {
                console.log(`${index + 1}. ${cat.name}`);
                console.log(`   ID: ${cat._id}`);
                console.log(`   Description: ${cat.description}`);
                console.log('');
            });
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

listCategories();
