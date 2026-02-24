const express = require('express');
const router = express.Router();
const rewardController = require('../controllers/rewardController');
const { authenticate } = require('../middleware/auth');

// Get user profile with points (public)
router.get('/profile/:userId', rewardController.getUserProfile);

// Transfer points to another user (requires auth)
router.post('/transfer', authenticate, rewardController.transferPoints);

// Upvote an answer (requires auth)
router.post('/answer/:answerId/upvote', authenticate, rewardController.upvoteAnswer);

// Downvote an answer (requires auth)
router.post('/answer/:answerId/downvote', authenticate, rewardController.downvoteAnswer);

// Delete an answer (requires auth)
router.delete('/answer/:answerId', authenticate, rewardController.deleteAnswer);

module.exports = router;
