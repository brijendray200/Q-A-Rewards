const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Admin middleware (add proper admin check)
const isAdmin = (req, res, next) => {
  // TODO: Implement proper admin check
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Dashboard stats
router.get('/dashboard', isAdmin, adminController.getDashboardStats);

// Adjust user points
router.post('/adjust-points', isAdmin, adminController.adjustUserPoints);

// Delete user
router.delete('/users/:userId', isAdmin, adminController.deleteUser);

// Flag content
router.post('/flag-content', isAdmin, adminController.flagContent);

module.exports = router;
