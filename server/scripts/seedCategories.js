const mongoose = require('mongoose');
const Category = require('../models/Category');
require('dotenv').config();

const categories = [
    {
        name: 'Abstract',
        description: 'Abstract art uses visual language of shape, form, color and line to create compositions.',
        image: '/images/categories/abstract.jpg'
    },
    {
        name: 'Landscape',
        description: 'Landscape paintings depict natural scenery such as mountains, valleys, trees, rivers, and forests.',
        image: '/images/categories/landscape.jpg'
    },
    {
        name: 'Portrait',
        description: 'Portrait art captures the likeness, personality, and mood of a person or group.',
        image: '/images/categories/portrait.jpg'
    },
    {
        name: 'Still Life',
        description: 'Still life paintings feature inanimate objects like flowers, food, or everyday items.',
        image: '/images/categories/still-life.jpg'
    },
    {
        name: 'Contemporary',
        description: 'Contemporary art reflects current ideas and concerns of our modern society.',
        image: '/images/categories/contemporary.jpg'
    },
    {
        name: 'Digital Art',
        description: 'Digital artwork created using digital technology and software.',
        image: '/images/categories/digital.jpg'
    },
    {
        name: 'Sculpture',
        description: 'Three-dimensional artworks created by shaping or combining materials.',
        image: '/images/categories/sculpture.jpg'
    },
    {
        name: 'Photography',
        description: 'Artistic photographs capturing moments, emotions, and beauty.',
        image: '/images/categories/photography.jpg'
    }
];

const seedCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing categories
        await Category.deleteMany({});
        console.log('Cleared existing categories');

        // Insert new categories
        const createdCategories = await Category.insertMany(categories);
        console.log('\n✅ Categories seeded successfully!\n');

        console.log('Created categories:');
        createdCategories.forEach(cat => {
            console.log(`- ${cat.name} (ID: ${cat._id})`);
        });

        console.log('\n📝 You can now use these category IDs when creating artworks!');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding categories:', error);
        process.exit(1);
    }
};

seedCategories();
