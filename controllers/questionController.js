const Question = require('../models/Question');
const Answer = require('../models/Answer');
const rewardService = require('../services/rewardService');
const badgeService = require('../services/badgeService');
const Validator = require('../utils/validator');
const logger = require('../utils/logger');

exports.createQuestion = async (req, res, next) => {
  try {
    const { title, content, tags } = req.body;
    
    const validation = Validator.validateQuestion({ title, content, tags });
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.errors.join(', ') });
    }

    const question = await Question.create({
      userId: req.user.id,
      title: Validator.sanitizeInput(title),
      content: Validator.sanitizeInput(content),
      tags
    });

    logger.info('Question created', { questionId: question._id, userId: req.user.id });
    res.status(201).json(question);
  } catch (error) {
    next(error);
  }
};

exports.getQuestions = async (req, res) => {
  try {
    const questions = await Question.find()
      .populate('userId', 'username points')
      .sort({ createdAt: -1 });
    res.json(questions);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('userId', 'username points badges')
      .populate({
        path: 'answers',
        populate: { path: 'userId', select: 'username points badges' }
      });
    
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json(question);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.createAnswer = async (req, res, next) => {
  try {
    const { content } = req.body;
    const questionId = req.params.id;
    
    const validation = Validator.validateAnswer({ content });
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.errors.join(', ') });
    }

    const answer = await Answer.create({
      questionId,
      userId: req.user.id,
      content: Validator.sanitizeInput(content)
    });

    await Question.findByIdAndUpdate(questionId, {
      $push: { answers: answer._id }
    });

    // Award 5 points for answering
    await rewardService.awardAnswerPoints(req.user.id, answer._id);

    // Check and award badges
    await badgeService.checkAndAwardBadges(req.user.id);

    logger.info('Answer created', { answerId: answer._id, userId: req.user.id });
    res.status(201).json(answer);
  } catch (error) {
    next(error);
  }
};

exports.searchQuestions = async (req, res) => {
  try {
    const { q, tags } = req.query;
    let query = {};

    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } }
      ];
    }

    if (tags) {
      query.tags = { $in: tags.split(',') };
    }

    const questions = await Question.find(query)
      .populate('userId', 'username points')
      .sort({ createdAt: -1 });
    
    res.json(questions);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
