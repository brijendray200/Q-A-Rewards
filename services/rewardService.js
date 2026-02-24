const User = require('../models/User');
const Answer = require('../models/Answer');
const PointTransaction = require('../models/PointTransaction');

class RewardService {
  // Award points for answering a question
  async awardAnswerPoints(userId, answerId) {
    const points = 5;
    await User.findByIdAndUpdate(userId, { $inc: { points } });
    
    await PointTransaction.create({
      fromUser: userId,
      toUser: userId,
      points,
      type: 'answer'
    });
    
    return points;
  }

  // Award points when answer receives upvotes
  async handleUpvote(answerId) {
    const answer = await Answer.findById(answerId).populate('userId');
    if (!answer) throw new Error('Answer not found');

    const newUpvotes = answer.upvotes + 1;
    await Answer.findByIdAndUpdate(answerId, { upvotes: newUpvotes });

    // Award 5 points for every 5 upvotes
    if (newUpvotes % 5 === 0) {
      const points = 5;
      await User.findByIdAndUpdate(answer.userId._id, { $inc: { points } });
      
      await PointTransaction.create({
        fromUser: answer.userId._id,
        toUser: answer.userId._id,
        points,
        type: 'upvote'
      });
    }
  }

  // Deduct points when answer receives downvotes
  async handleDownvote(answerId) {
    const answer = await Answer.findById(answerId).populate('userId');
    if (!answer) throw new Error('Answer not found');

    await Answer.findByIdAndUpdate(answerId, { downvotes: answer.downvotes + 1 });

    const points = -1;
    await User.findByIdAndUpdate(answer.userId._id, { $inc: { points } });
    
    await PointTransaction.create({
      fromUser: answer.userId._id,
      toUser: answer.userId._id,
      points,
      type: 'downvote'
    });
  }

  // Remove points when answer is deleted
  async handleAnswerRemoval(answerId) {
    const answer = await Answer.findById(answerId).populate('userId');
    if (!answer) throw new Error('Answer not found');

    // Calculate total points to deduct
    let pointsToDeduct = answer.pointsAwarded;
    const upvoteBonus = Math.floor(answer.upvotes / 5) * 5;
    pointsToDeduct += upvoteBonus;

    await User.findByIdAndUpdate(answer.userId._id, { $inc: { points: -pointsToDeduct } });
    
    await PointTransaction.create({
      fromUser: answer.userId._id,
      toUser: answer.userId._id,
      points: -pointsToDeduct,
      type: 'answer_removed'
    });

    await Answer.findByIdAndDelete(answerId);
  }

  // Transfer points between users
  async transferPoints(fromUserId, toUserId, points) {
    const fromUser = await User.findById(fromUserId);
    if (!fromUser) throw new Error('Sender not found');
    
    if (fromUser.points < 10) {
      throw new Error('You need at least 10 points to transfer');
    }
    
    if (points > fromUser.points) {
      throw new Error('Insufficient points');
    }

    await User.findByIdAndUpdate(fromUserId, { $inc: { points: -points } });
    await User.findByIdAndUpdate(toUserId, { $inc: { points } });
    
    await PointTransaction.create({
      fromUser: fromUserId,
      toUser: toUserId,
      points,
      type: 'transfer'
    });

    return { success: true };
  }

  // Get user profile with points
  async getUserProfile(userId) {
    const user = await User.findById(userId).select('username email points badges');
    if (!user) throw new Error('User not found');
    return user;
  }
}

module.exports = new RewardService();
