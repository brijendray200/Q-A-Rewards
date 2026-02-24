// Mock authentication middleware
// Replace with your actual authentication logic (JWT, sessions, etc.)

const User = require('../models/User');

exports.authenticate = async (req, res, next) => {
  try {
    // Mock: Get user ID from header
    const userId = req.headers['x-user-id'];
    
    // Skip auth for public endpoints
    if (req.path.includes('/leaderboard') || req.path.includes('/profile')) {
      if (!userId) {
        return next();
      }
    }
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = { id: userId };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};
