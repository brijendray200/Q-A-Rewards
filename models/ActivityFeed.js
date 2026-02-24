const mongoose = require('mongoose');

const activityFeedSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  activityType: {
    type: String,
    enum: ['question_posted', 'answer_posted', 'upvote_received', 'badge_earned', 'points_transferred'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId
  },
  points: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('ActivityFeed', activityFeedSchema);
