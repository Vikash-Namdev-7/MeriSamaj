const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./config/config');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');
const rootRouter = require('./routes/index');

const app = express();

// Connect to Database
connectDB();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root API Router
app.use('/api', rootRouter);

// Health Check Endpoint
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  res.status(200).json({
    status: 'success',
    message: 'Meri Samaj API Gateway is running smoothly',
    timestamp: new Date(),
    database: dbStatus
  });
});

// 404 Route handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

// Global Error Handling Middleware
app.use(errorHandler);

module.exports = app;
