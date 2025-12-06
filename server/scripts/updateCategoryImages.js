const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('../models/Category');

dotenv.config();

const categoryImages = {
    'Abstract': 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop',
    'Landscape': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    'Portrait': 'https://images.unsplash.com/photo-1513721032312-6a18a42c8763?w=800&h=600&fit=crop',
    'Still Life': 'https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?w=800&h=600&fit=crop',
    'Contemporary': 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=800&h=600&fit=crop',
};

const updateCategoryImages = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const categories = await Category.find({});
        console.log(`Found ${categories.length} categories`);

        for (const category of categories) {
            // Only update if category doesn't have an image
            if (!category.image && categoryImages[category.name]) {
                category.image = categoryImages[category.name];
                await category.save();
                console.log(`✓ Updated ${category.name} with image`);
            } else if (category.image) {
                console.log(`- ${category.name} already has an image`);
            } else {
                console.log(`- No image available for ${category.name}`);
            }
        }

        console.log('\n✅ Category images updated successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

updateCategoryImages();
