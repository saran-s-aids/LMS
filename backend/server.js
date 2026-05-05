// Smart Campus LMS Backend - Production Deployment
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const mongoose = require('mongoose');
const Message = require('./models/Message');

// Connect to Database
connectDB().catch(err => {
    console.error('Initial Database Connection Error:', err.message);
});

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: [
            'http://localhost:5173',
            'http://localhost:3000',
            'https://lms-p8nx.vercel.app',
            'https://lms-3-0mws.onrender.com',
            process.env.FRONTEND_URL,
        ].filter(Boolean),
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Allowed origins whitelist
const ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://lms-p8nx.vercel.app',
    'https://lms-3-0mws.onrender.com',
    process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (ALLOWED_ORIGINS.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Socket.IO
io.on('connection', (socket) => {
    socket.on('join_chat', (userId) => socket.join(userId));
    socket.on('send_message', async (data) => {
        try {
            const { senderId, receiverId, message } = data;
            const newMessage = await Message.create({ senderId, receiverId, message });
            io.to(receiverId).emit('receive_message', newMessage);
            io.to(senderId).emit('receive_message', newMessage);
        } catch (error) {
            console.error('Error saving message:', error);
        }
    });
    socket.on('disconnect', () => console.log('User disconnected'));
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/student', require('./routes/studentRoutes'));
app.use('/api/marketplace', require('./routes/marketplaceRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/requests', require('./routes/bookRequestRoutes'));
app.use('/api/issued', require('./routes/issuedBookRoutes'));

// Health Check
app.get('/', (req, res) => {
    res.json({ 
        message: 'Smart Campus LMS API is running...',
        env: process.env.NODE_ENV,
        dbStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong on the server!',
        error: process.env.NODE_ENV === 'production' ? {} : err.message
    });
});

// Port
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
