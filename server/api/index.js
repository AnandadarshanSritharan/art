const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('../config/db');

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();

const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://ceycanvas.com",
    "https://www.ceycanvas.com"
];

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express.json());

// Connect to database on first request
let isConnected = false;
app.use(async (req, res, next) => {
    if (!isConnected) {
        try {
            await connectDB();
            isConnected = true;
        } catch (error) {
            console.error('Database connection failed:', error);
            return res.status(500).json({ message: 'Database connection failed', error: error.message });
        }
    }
    next();
});

// Import routes
app.use('/api/auth', require('../routes/authRoutes'));
app.use('/api/categories', require('../routes/categoryRoutes'));
app.use('/api/artworks', require('../routes/artworkRoutes'));
app.use('/api/artists', require('../routes/artistRoutes'));
app.use('/api/orders', require('../routes/orderRoutes'));
app.use('/api/payment', require('../routes/paymentRoutes'));
app.use('/api/upload', require('../routes/uploadRoutes'));
app.use('/api/messages', require('../routes/messageRoutes'));
app.use('/api/terms', require('../routes/termsRoutes'));

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.get('/api', (req, res) => {
    res.json({ message: 'API is running...' });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

module.exports = app;
