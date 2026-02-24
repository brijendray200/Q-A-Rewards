const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
const rewardRoutes = require('./routes/rewards');
const questionRoutes = require('./routes/questions');
const leaderboardRoutes = require('./routes/leaderboard');
const { authenticate } = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');
const logger = require('./utils/logger');

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(rateLimiter(100, 60000)); // 100 requests per minute

// Routes
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/rewards', authenticate, rewardRoutes);
app.use('/api/questions', authenticate, questionRoutes);

// Error handler
app.use(errorHandler);

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/reward-system')
  .then(() => {
    logger.info('Connected to MongoDB');
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    logger.error('MongoDB connection error', { error: err.message });
    console.error('MongoDB connection error:', err);
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend: http://localhost:${PORT}`);
});

module.exports = app;
