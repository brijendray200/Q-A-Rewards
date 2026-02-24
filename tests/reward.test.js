const rewardService = require('../services/rewardService');
const User = require('../models/User');
const Answer = require('../models/Answer');

describe('Reward System Tests', () => {
  let testUser;
  let testAnswer;

  beforeEach(async () => {
    // Create test user
    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      points: 0
    });

    // Create test answer
    testAnswer = await Answer.create({
      questionId: 'mockQuestionId',
      userId: testUser._id,
      content: 'Test answer'
    });
  });

  test('User gets 5 points for answering', async () => {
    await rewardService.awardAnswerPoints(testUser._id, testAnswer._id);
    const user = await User.findById(testUser._id);
    expect(user.points).toBe(5);
  });

  test('User gets 5 bonus points for every 5 upvotes', async () => {
    // Simulate 5 upvotes
    for (let i = 0; i < 5; i++) {
      await rewardService.handleUpvote(testAnswer._id);
    }
    
    const user = await User.findById(testUser._id);
    expect(user.points).toBe(5); // 5 bonus points
  });

  test('User loses 1 point for downvote', async () => {
    await rewardService.awardAnswerPoints(testUser._id, testAnswer._id);
    await rewardService.handleDownvote(testAnswer._id);
    
    const user = await User.findById(testUser._id);
    expect(user.points).toBe(4); // 5 - 1
  });

  test('Cannot transfer points with less than 10 points', async () => {
    const user2 = await User.create({
      username: 'user2',
      email: 'user2@example.com',
      points: 0
    });

    await expect(
      rewardService.transferPoints(testUser._id, user2._id, 5)
    ).rejects.toThrow('You need at least 10 points to transfer');
  });

  test('Can transfer points with 10+ points', async () => {
    await User.findByIdAndUpdate(testUser._id, { points: 15 });
    
    const user2 = await User.create({
      username: 'user2',
      email: 'user2@example.com',
      points: 0
    });

    await rewardService.transferPoints(testUser._id, user2._id, 5);
    
    const sender = await User.findById(testUser._id);
    const receiver = await User.findById(user2._id);
    
    expect(sender.points).toBe(10);
    expect(receiver.points).toBe(5);
  });

  test('Points deducted when answer is deleted', async () => {
    await rewardService.awardAnswerPoints(testUser._id, testAnswer._id);
    
    // Add some upvotes
    await Answer.findByIdAndUpdate(testAnswer._id, { upvotes: 10 });
    
    await rewardService.handleAnswerRemoval(testAnswer._id);
    
    const user = await User.findById(testUser._id);
    expect(user.points).toBe(-10); // Lost 5 (answer) + 10 (2x5 upvote bonus)
  });
});
