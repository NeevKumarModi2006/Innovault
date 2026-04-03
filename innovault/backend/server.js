/**
 * Innovault — Main Server Entry Point
 * ─────────────────────────────────────
 * Bootstraps Express, connects to MongoDB, and mounts all route modules.
 *
 * Architecture:
 *   config/        → External service configs (Cloudinary, Redis, Kafka)
 *   middleware/     → Express middleware (auth, upload, cache)
 *   models/        → Mongoose schemas
 *   routes/        → HTTP route handlers
 *   services/      → Business logic / utility services (cacheService)
 *   events/        → Kafka event producer
 *
 * MODULARITY: Each concern lives in its own directory.
 * All external services (Redis, Kafka, Cloudinary) gracefully bypass
 * when credentials are absent, so local dev works out of the box.
 */

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

// Trust reverse proxy (e.g., localhost.run or Nginx) for rate-limiting
app.set('trust proxy', true);

// Security headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Gzip compress all responses
app.use(compression());

// CORS — dynamically allow any origin (perfect for tunnels/presentation)
app.use(cors({
    origin: function (origin, callback) {
        callback(null, true);
    },
    credentials: true
}));

app.use(express.json({
    // Capture the raw body string to verify QStash webhook signatures securely
    verify: (req, res, buf) => {
        req.rawBody = buf.toString();
    }
}));
 
// Rate limiting — 1000 requests per IP per 15 minutes
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false, default: false },
    message: { message: 'Too many requests, please try again later.' }
});
app.use('/api', limiter);

// Database Connection
mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/innovault')
    .then(() => console.log('Connected to Innovault Database'))
    .catch(err => console.error('Database connection failed:', err));

// ── Route Modules ──────────────────────────────────────────
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const imageRoutes = require('./routes/images');
const webhookRoutes = require('./routes/webhooks');

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/webhooks', webhookRoutes);

// Static Uploads (local fallback — still useful when Cloudinary is not configured)
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
    res.send('Innovault API is running...');
});

// ── Graceful Shutdown ──────────────────────────────────────
const { disconnectProducer } = require('./events/producer');

process.on('SIGTERM', async () => {
    console.log('SIGTERM received — shutting down gracefully...');
    await disconnectProducer();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received — shutting down gracefully...');
    await disconnectProducer();
    process.exit(0);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
