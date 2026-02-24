const ActivityFeed = require('../models/ActivityFeed');

class ActivityService {
  async logActivity(userId, activityType, description, relatedId = null, points = 0) {
    return await ActivityFeed.create({
      userId,
      activityType,
      description,
      relatedId,
      points
    });
  }

  async getUserActivity(userId, limit = 20) {
    return await ActivityFeed.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  async getGlobalActivity(limit = 50) {
    return await ActivityFeed.find()
      .populate('userId', 'username')
      .sort({ createdAt: -1 })
      .limit(limit);
  }
}

module.exports = new ActivityService();
