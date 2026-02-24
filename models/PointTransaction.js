const mongoose = require('mongoose');

const pointTransactionSchema = new mongoose.Schema({
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  points: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['transfer', 'answer', 'upvote', 'downvote', 'answer_removed'],
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('PointTransaction', pointTransactionSchema);
