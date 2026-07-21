const express = require('express');
const http    = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./config/config');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');
const rootRouter = require('./routes/index');
const cookieParser = require('cookie-parser');
const matrimonialSocket = require('./services/matrimonialSocket');

// Load optional security middlewares with try-catch fallbacks to prevent crashes
let helmet;
try {
  helmet = require('helmet');
} catch (e) {
  console.warn('helmet package not loaded - run npm install to activate');
}

let mongoSanitize;
try {
  mongoSanitize = require('express-mongo-sanitize');
} catch (e) {
  console.warn('express-mongo-sanitize package not loaded - run npm install to activate');
}

let rateLimit;
try {
  rateLimit = require('express-rate-limit');
} catch (e) {
  console.warn('express-rate-limit package not loaded - run npm install to activate');
}

const app = express();

// Connect to Database
connectDB();

// Global Middlewares
if (helmet) {
  app.use(helmet());
}

if (mongoSanitize) {
  app.use(mongoSanitize());
}

if (rateLimit) {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Dev-friendly limit
    message: { status: 'error', message: 'Too many requests from this IP, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false
  });
  app.use('/api', limiter);
}

app.use(cors({
  origin: process.env.CLIENT_URL 
    ? process.env.CLIENT_URL.split(',') 
    : true,
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// Root API Router
app.use('/api/v1', rootRouter);

// 404 Route handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

// Global Error Handling Middleware
app.use(errorHandler);

// ─── Socket.io Setup ─────────────────────────────────────────────────────────
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL
      ? process.env.CLIENT_URL.split(',')
      : true,
    credentials: true
  }
});

// Register socket handlers
matrimonialSocket(io);

// Attach io to app for access in controllers if needed
app.set('io', io);

module.exports = { app, httpServer };
