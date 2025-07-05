const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
require('dotenv').config(); // Load environment variables from .env file
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes'); // Task routes added
const friendRoutes = require('./routes/friendRoutes');
const dashboardRotes = require('./routes/dashboardRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');

const app = express();
const port = process.env.PORT || 5500; // Use port from .env or default to 5500

// Middleware
const corsOptions = {
    origin: process.env.CLIENT_URL || 'http://localhost:3000', // Allow requests from your frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true, // Allows session cookies to be sent
};
app.use(cors(corsOptions));
app.use(express.json()); // Use Express built-in JSON parser

// MongoDB Connection
const uri = process.env.MONGO_URI; // Use the connection string from .env
const sessionSecret = process.env.JWT_SECRET; // Use the session secret from .env

// Validate required environment variables
if (!uri || !sessionSecret) {
    console.error('MongoDB URI and Session secret must be defined in .env file');
    process.exit(1); // Exit the application if required variables are not defined
}

// Connect to MongoDB without deprecated options
mongoose.connect(uri)
    .then(() => console.log('MongoDB connected'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1); // Exit the application if connection fails
    });

// Session Middleware
app.use(session({
    secret: sessionSecret, // Use session secret from .env
    resave: false, // Avoid resaving session if not modified
    saveUninitialized: false, // Avoid saving empty sessions
    store: MongoStore.create({
        mongoUrl: uri, // Reuse the same MongoDB URI
        collectionName: 'sessions', // Store session data in the 'sessions' collection
        ttl: 14 * 24 * 60 * 60, // 14 days expiration
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 day session expiration
        secure: process.env.NODE_ENV === 'production', // Secure in production
        httpOnly: true, // Prevent cookie access via JavaScript
    }
}));

// Routes
app.use('/api/users', userRoutes); // User routes
app.use('/api/tasks', taskRoutes); // Task routes
app.use('/api/friends',friendRoutes);
app.use('/api/dashboard',dashboardRotes);
app.use('/api/chatbot', chatbotRoutes); 

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error' });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection closed due to app termination');
    process.exit(0);
});