const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  points: {
    type: Number,
    default: 0,
    min: 0
  },
  badges: [{
    name: String,
    earnedAt: Date
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
