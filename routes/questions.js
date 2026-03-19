const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const { authenticate } = require('../middleware/auth');

// Public routes - no auth needed
router.get('/', questionController.getQuestions);
router.get('/search', questionController.searchQuestions);
router.get('/:id', questionController.getQuestion);

// Protected routes - auth required
router.post('/', authenticate, questionController.createQuestion);
router.post('/:id/answers', authenticate, questionController.createAnswer);

module.exports = router;
