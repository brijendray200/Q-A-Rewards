const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');

// Create a question
router.post('/', questionController.createQuestion);

// Get all questions
router.get('/', questionController.getQuestions);

// Search questions
router.get('/search', questionController.searchQuestions);

// Get single question with answers
router.get('/:id', questionController.getQuestion);

// Create an answer
router.post('/:id/answers', questionController.createAnswer);

module.exports = router;
