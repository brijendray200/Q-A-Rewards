const User = require('../models/User');
const Answer = require('../models/Answer');

exports.getTopUsers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const users = await User.find()
      .select('username points badges')
      .sort({ points: -1 })
      .limit(limit);
    
    res.json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getTopAnswerers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const topAnswerers = await Answer.aggregate([
      {
        $group: {
          _id: '$userId',
          totalAnswers: { $sum: 1 },
          totalUpvotes: { $sum: '$upvotes' }
        }
      },
      { $sort: { totalAnswers: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          username: '$user.username',
          points: '$user.points',
          totalAnswers: 1,
          totalUpvotes: 1
        }
      }
    ]);

    res.json(topAnswerers);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getUserStats = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).select('username points badges');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const answers = await Answer.find({ userId });
    const totalUpvotes = answers.reduce((sum, a) => sum + a.upvotes, 0);
    const totalDownvotes = answers.reduce((sum, a) => sum + a.downvotes, 0);

    const PointTransaction = require('../models/PointTransaction');
    const pointsGiven = await PointTransaction.aggregate([
      { $match: { fromUser: user._id, type: 'transfer' } },
      { $group: { _id: null, total: { $sum: '$points' } } }
    ]);

    const pointsReceived = await PointTransaction.aggregate([
      { $match: { toUser: user._id, type: 'transfer' } },
      { $group: { _id: null, total: { $sum: '$points' } } }
    ]);

    res.json({
      user,
      stats: {
        totalAnswers: answers.length,
        totalUpvotes,
        totalDownvotes,
        pointsGiven: pointsGiven[0]?.total || 0,
        pointsReceived: pointsReceived[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
