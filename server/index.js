require('dotenv').config();
require('dns').setServers(['8.8.8.8', '8.8.4.4']); // Override DNS to bypass local SRV lookup failure

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { setupCronJobs } = require('./cron');
const mongoose = require('mongoose');

const app = express();
const allowedOrigins = [
    process.env.CLIENT_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    'http://localhost:5173',
    'http://127.0.0.1:5173'
].filter(Boolean);
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error('CORS not allowed'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'AI Tool Tracker API is running'
    });
});

app.get('/health', (req, res) => {
    const dbState = mongoose.connection.readyState;
    const isDbConnected = dbState === 1;

    res.status(200).json({
        success: true,
        status: 'ok',
        database: isDbConnected ? 'connected' : 'disconnected'
    });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tools', require('./routes/toolRoutes'));
app.use('/api/emails', require('./routes/emailRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/export', require('./routes/exportRoutes'));

// Global Error Handler for Production
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        success: false
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    setupCronJobs();

    connectDB().then((connected) => {
        if (!connected) {
            console.warn('Server is running, but MongoDB is not connected yet.');
        }
    });
});
