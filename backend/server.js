const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const feedbackRoutes = require('./routes/feedback');
const galleryRoutes = require('./routes/gallery');

const app = express();

// ── Security Middleware ──────────────────────────────────────────────────────
// Helmet sets secure HTTP headers (XSS-Filter, HSTS, CSP, etc.)
app.use(helmet());

// Content-Security-Policy - restricts resource origins to mitigate XSS
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
    },
  })
);

// NoSQL Injection prevention — strips $ and . from req.body / query / params
app.use(mongoSanitize());

// Rate limiting — prevents brute-force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Stricter limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many login attempts, please try again later.' },
});
app.use('/api/auth/', authLimiter);

// ── General Middleware ───────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));          // body size limit
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/gallery', galleryRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ── 404 / Error Handlers ─────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

// ── DB & Server Start ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  if (process.env.MONGO_URI) {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  }
  return app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

if (require.main === module) {
  startServer();
}

// Export app directly for supertest (no listen needed — supertest binds its own)
module.exports = { app, startServer };

