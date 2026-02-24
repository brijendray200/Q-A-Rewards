const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController');

// Get top users by points
router.get('/top-users', leaderboardController.getTopUsers);

// Get top answerers
router.get('/top-answerers', leaderboardController.getTopAnswerers);

// Get user stats
router.get('/user/:userId/stats', leaderboardController.getUserStats);

module.exports = router;
