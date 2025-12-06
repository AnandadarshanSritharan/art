const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Artwork = require('../models/Artwork');

dotenv.config();

const migrateArtworks = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const artworks = await Artwork.find({});
        console.log(`Found ${artworks.length} artworks to check`);

        const artistMap = new Map();

        // 1. Identify unique artists from string names
        for (const artwork of artworks) {
            // Check if artist is already an ObjectId (migration already done for this one)
            if (mongoose.Types.ObjectId.isValid(artwork.artist)) {
                continue;
            }

            const artistName = artwork.artist;
            if (!artistMap.has(artistName)) {
                artistMap.set(artistName, []);
            }
            artistMap.get(artistName).push(artwork);
        }

        console.log(`Found ${artistMap.size} unique artists to migrate`);

        // 2. Create users for artists and update artworks
        for (const [artistName, artistArtworks] of artistMap) {
            console.log(`Processing map entry: ${artistName}, Artworks count: ${artistArtworks?.length}`);
            if (!artistName) {
                console.log('Skipping undefined artist name');
                continue;
            }
            let user = await User.findOne({ name: artistName });

            if (!user) {
                // Create new artist user
                const email = `${artistName.toLowerCase().replace(/\s+/g, '')}@example.com`;

                console.log(`Creating new user for artist: ${artistName} (${email})`);

                user = await User.create({
                    name: artistName,
                    email: email,
                    password: '123456', // Will be hashed by User model pre-save hook
                    isArtist: true,
                    bio: 'Professional artist.'
                });
            } else {
                // Update existing user to be an artist
                if (!user.isArtist) {
                    console.log(`Updating existing user to artist: ${artistName}`);
                    user.isArtist = true;
                    await user.save();
                }
            }

            console.log(`Processing artist: ${artistName} -> User ID: ${user._id}`);

            // Update all artworks for this artist
            for (const artwork of artistArtworks) {
                await Artwork.updateOne(
                    { _id: artwork._id },
                    { $set: { artist: user._id } }
                );
                console.log(`Updated artwork: ${artwork.title}`);
            }
        }

        console.log('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error Details:', error);
        if (error.errors) {
            Object.keys(error.errors).forEach(key => {
                console.error(`Validation Error [${key}]:`, error.errors[key].message);
            });
        }
        process.exit(1);
    }
};

migrateArtworks();
