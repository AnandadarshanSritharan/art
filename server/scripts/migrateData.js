const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

// Import models
const Artwork = require('../models/Artwork');
const Category = require('../models/Category');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Order = require('../models/Order');
const TermsAndConditions = require('../models/TermsAndConditions');
const User = require('../models/User');

const LOCAL_URI = 'mongodb://localhost:27017/art-platform';
const CLOUD_URI = process.env.MONGO_URI;

const migrate = async () => {
    try {
        console.log('Starting migration...');
        console.log('Cloud URI loaded:', CLOUD_URI ? 'Yes' : 'No'); // Don't log full URI for security/clutter

        if (!CLOUD_URI) {
            throw new Error('MONGO_URI is not defined in .env');
        }

        // --- STEP 1: READ FROM LOCAL ---
        console.log(`Connecting to LOCAL DB: ${LOCAL_URI}`);
        await mongoose.connect(LOCAL_URI);

        console.log('Fetching data from local database...');
        const artworks = await Artwork.find({}).lean();
        const categories = await Category.find({}).lean();
        const conversations = await Conversation.find({}).lean();
        const messages = await Message.find({}).lean();
        const orders = await Order.find({}).lean();
        // Wrap Terms content in try-catch in case model name mismatch or empty
        let terms = [];
        try {
            terms = await TermsAndConditions.find({}).lean();
        } catch (e) {
            console.warn('Could not fetch terms, skipping:', e.message);
        }
        const users = await User.find({}).lean();

        console.log(`Fetched:
    - Artworks: ${artworks.length}
    - Categories: ${categories.length}
    - Conversations: ${conversations.length}
    - Messages: ${messages.length}
    - Orders: ${orders.length}
    - Terms: ${terms.length}
    - Users: ${users.length}
    `);

        await mongoose.disconnect();
        console.log('Disconnected from LOCAL DB.');

        if (artworks.length === 0 && users.length === 0) {
            console.warn('Local database seems empty. Proceeding anyway.');
        }

        // --- STEP 2: WRITE TO CLOUD ---
        console.log(`Connecting to CLOUD DB...`);
        // Connect to cloud
        await mongoose.connect(CLOUD_URI);

        console.log('Clearing existing data in CLOUD DB...');
        // Clear cloud collections
        await Artwork.deleteMany({});
        await Category.deleteMany({});
        await Conversation.deleteMany({});
        await Message.deleteMany({});
        await Order.deleteMany({});
        await TermsAndConditions.deleteMany({});
        await User.deleteMany({});

        console.log('Inserting data into CLOUD DB...');
        if (users.length) await User.insertMany(users);
        if (categories.length) await Category.insertMany(categories);
        if (artworks.length) await Artwork.insertMany(artworks);
        if (conversations.length) await Conversation.insertMany(conversations);
        if (messages.length) await Message.insertMany(messages);
        if (orders.length) await Order.insertMany(orders);
        if (terms.length) await TermsAndConditions.insertMany(terms);

        console.log('Migration completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
