const rewardService = require('../services/rewardService');

exports.getUserProfile = async (req, res) => {
  try {
    const profile = await rewardService.getUserProfile(req.params.userId);
    res.json(profile);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

exports.transferPoints = async (req, res) => {
  try {
    const { toUserId, points } = req.body;
    const fromUserId = req.user.id; // Assuming auth middleware sets req.user
    
    const result = await rewardService.transferPoints(fromUserId, toUserId, points);
    res.json({ message: 'Points transferred successfully', ...result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.upvoteAnswer = async (req, res) => {
  try {
    await rewardService.handleUpvote(req.params.answerId);
    res.json({ message: 'Answer upvoted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.downvoteAnswer = async (req, res) => {
  try {
    await rewardService.handleDownvote(req.params.answerId);
    res.json({ message: 'Answer downvoted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteAnswer = async (req, res) => {
  try {
    await rewardService.handleAnswerRemoval(req.params.answerId);
    res.json({ message: 'Answer deleted and points adjusted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
