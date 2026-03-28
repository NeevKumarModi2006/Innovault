const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security headers
app.use(helmet());

// Gzip compress all responses
app.use(compression());

// CORS — origin from env for easy local <-> deployed switching
app.use(cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());

// Rate limiting — 100 requests per IP per 15 minutes
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests, please try again later.' }
});
app.use('/api', limiter);

// Database Connection
mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/innovault')
    .then(() => console.log('Connected to Innovault Database'))
    .catch(err => console.error('Database connection failed:', err));

// Routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

// Static Uploads
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
    res.send('Innovault API is running...');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
