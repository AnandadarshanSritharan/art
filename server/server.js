const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

dotenv.config();

connectDB();

const app = express();
const server = http.createServer(app);
const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://frontend-chi-peach-fzgzfuzz58.vercel.app"
];

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Make io accessible to our router
app.set('io', io);

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/artworks', require('./routes/artworkRoutes'));
app.use('/api/artists', require('./routes/artistRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/terms', require('./routes/termsRoutes'));

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join user to their own room
    socket.on('join', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined their room`);
    });

    // Handle new message
    socket.on('sendMessage', (data) => {
        // Emit to recipient
        io.to(data.recipientId).emit('newMessage', data.message);
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
        io.to(data.recipientId).emit('userTyping', {
            conversationId: data.conversationId,
            isTyping: true
        });
    });

    socket.on('stopTyping', (data) => {
        io.to(data.recipientId).emit('userTyping', {
            conversationId: data.conversationId,
            isTyping: false
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
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

const PORT = process.env.PORT || 5000;

// Export for Vercel
module.exports = app;

// Only listen if strict server (local dev)
if (require.main === module) {
    server.listen(PORT, console.log(`Server running on port ${PORT}`));
}
