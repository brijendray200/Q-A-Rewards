const User = require('../models/User');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const PointTransaction = require('../models/PointTransaction');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalQuestions = await Question.countDocuments();
    const totalAnswers = await Answer.countDocuments();
    const totalPoints = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$points' } } }
    ]);

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('username email points createdAt');

    const recentQuestions = await Question.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'username');

    const pointsDistribution = await PointTransaction.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalPoints: { $sum: '$points' }
        }
      }
    ]);

    res.json({
      stats: {
        totalUsers,
        totalQuestions,
        totalAnswers,
        totalPoints: totalPoints[0]?.total || 0
      },
      recentUsers,
      recentQuestions,
      pointsDistribution
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.adjustUserPoints = async (req, res) => {
  try {
    const { userId, points, reason } = req.body;
    
    await User.findByIdAndUpdate(userId, { $inc: { points } });
    
    await PointTransaction.create({
      fromUser: userId,
      toUser: userId,
      points,
      type: 'admin_adjustment',
      reason
    });

    res.json({ message: 'Points adjusted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Delete user's questions, answers, and transactions
    await Question.deleteMany({ userId });
    await Answer.deleteMany({ userId });
    await PointTransaction.deleteMany({ 
      $or: [{ fromUser: userId }, { toUser: userId }] 
    });
    await User.findByIdAndDelete(userId);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.flagContent = async (req, res) => {
  try {
    const { contentType, contentId, reason } = req.body;
    
    const Model = contentType === 'question' ? Question : Answer;
    await Model.findByIdAndUpdate(contentId, { 
      flagged: true, 
      flagReason: reason 
    });

    res.json({ message: 'Content flagged successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
