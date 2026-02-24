const badgeService = require('../services/badgeService');
const User = require('../models/User');
const Answer = require('../models/Answer');

describe('Badge System Tests', () => {
  let testUser;

  beforeEach(async () => {
    testUser = await User.create({
      username: 'badgeuser',
      email: 'badge@example.com',
      points: 0,
      badges: []
    });
  });

  test('User gets First Answer badge', async () => {
    await Answer.create({
      questionId: 'mockQuestionId',
      userId: testUser._id,
      content: 'First answer'
    });

    const badges = await badgeService.checkAndAwardBadges(testUser._id);
    expect(badges.length).toBeGreaterThan(0);
    expect(badges[0].name).toBe('First Answer');
  });

  test('User gets Helpful badge after 10 answers', async () => {
    // Create 10 answers
    for (let i = 0; i < 10; i++) {
      await Answer.create({
        questionId: 'mockQuestionId',
        userId: testUser._id,
        content: `Answer ${i}`
      });
    }

    const badges = await badgeService.checkAndAwardBadges(testUser._id);
    const helpfulBadge = badges.find(b => b.name === 'Helpful');
    expect(helpfulBadge).toBeDefined();
  });

  test('User gets Popular Answer badge for 10+ upvotes', async () => {
    await Answer.create({
      questionId: 'mockQuestionId',
      userId: testUser._id,
      content: 'Popular answer',
      upvotes: 15
    });

    const badges = await badgeService.checkAndAwardBadges(testUser._id);
    const popularBadge = badges.find(b => b.name === 'Popular Answer');
    expect(popularBadge).toBeDefined();
  });

  test('User gets Point Millionaire badge at 1000 points', async () => {
    await User.findByIdAndUpdate(testUser._id, { points: 1000 });

    const badges = await badgeService.checkAndAwardBadges(testUser._id);
    const millionaireBadge = badges.find(b => b.name === 'Point Millionaire');
    expect(millionaireBadge).toBeDefined();
  });
});
