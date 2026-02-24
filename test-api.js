const mongoose = require('mongoose');
const User = require('./models/User');
const Question = require('./models/Question');
const Answer = require('./models/Answer');
const rewardService = require('./services/rewardService');
const badgeService = require('./services/badgeService');

async function testCompleteFlow() {
  try {
    console.log('🚀 Starting Complete API Test...\n');

    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/reward-system');
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    await User.deleteMany({});
    await Question.deleteMany({});
    await Answer.deleteMany({});
    console.log('🧹 Cleared existing data\n');

    // 1. Create Test Users
    console.log('👥 Creating test users...');
    const user1 = await User.create({
      username: 'alice',
      email: 'alice@example.com',
      points: 0,
      badges: []
    });
    console.log(`✅ User 1 created: ${user1.username} (ID: ${user1._id})`);

    const user2 = await User.create({
      username: 'bob',
      email: 'bob@example.com',
      points: 0,
      badges: []
    });
    console.log(`✅ User 2 created: ${user2.username} (ID: ${user2._id})\n`);

    // 2. Create Question
    console.log('❓ Creating question...');
    const question = await Question.create({
      userId: user1._id,
      title: 'React mein state kaise manage karein?',
      content: 'Mujhe React state management samajh nahi aa raha. Koi help kar sakta hai?',
      tags: ['react', 'javascript', 'state']
    });
    console.log(`✅ Question created: "${question.title}"\n`);

    // 3. User2 answers the question (gets 5 points)
    console.log('💬 User2 answering the question...');
    const answer = await Answer.create({
      questionId: question._id,
      userId: user2._id,
      content: 'React mein state manage karne ke liye useState hook use karo. Example: const [count, setCount] = useState(0);'
    });
    await Question.findByIdAndUpdate(question._id, { $push: { answers: answer._id } });
    await rewardService.awardAnswerPoints(user2._id, answer._id);
    
    let user2Updated = await User.findById(user2._id);
    console.log(`✅ Answer posted! User2 points: ${user2Updated.points} (+5 for answer)\n`);

    // 4. Check badges
    console.log('🏅 Checking badges...');
    const badges = await badgeService.checkAndAwardBadges(user2._id);
    if (badges.length > 0) {
      console.log(`✅ Badges awarded: ${badges.map(b => b.name).join(', ')}\n`);
    }

    // 5. Upvote the answer 5 times (user2 gets 5 bonus points)
    console.log('👍 Upvoting answer 5 times...');
    for (let i = 1; i <= 5; i++) {
      await rewardService.handleUpvote(answer._id);
      console.log(`  Upvote ${i}/5`);
    }
    user2Updated = await User.findById(user2._id);
    console.log(`✅ After 5 upvotes, User2 points: ${user2Updated.points} (+5 bonus)\n`);

    // 6. Create more answers to test badges
    console.log('📝 Creating more answers for badge testing...');
    for (let i = 1; i <= 3; i++) {
      const q = await Question.create({
        userId: user1._id,
        title: `Question ${i}`,
        content: `Test question ${i}`,
        tags: ['test']
      });
      
      const a = await Answer.create({
        questionId: q._id,
        userId: user2._id,
        content: `Answer ${i}`
      });
      
      await rewardService.awardAnswerPoints(user2._id, a._id);
    }
    user2Updated = await User.findById(user2._id);
    console.log(`✅ Created 3 more answers. User2 points: ${user2Updated.points}\n`);

    // 7. Test point transfer (user2 has 25 points now)
    console.log('💸 Testing point transfer...');
    console.log(`  User2 current points: ${user2Updated.points}`);
    
    if (user2Updated.points >= 10) {
      await rewardService.transferPoints(user2._id, user1._id, 10);
      user2Updated = await User.findById(user2._id);
      const user1Updated = await User.findById(user1._id);
      console.log(`✅ Transferred 10 points from User2 to User1`);
      console.log(`  User2 points: ${user2Updated.points}`);
      console.log(`  User1 points: ${user1Updated.points}\n`);
    }

    // 8. Test transfer with less than 10 points (should fail)
    console.log('❌ Testing transfer with insufficient points...');
    const user3 = await User.create({
      username: 'charlie',
      email: 'charlie@example.com',
      points: 5
    });
    
    try {
      await rewardService.transferPoints(user3._id, user1._id, 3);
      console.log('  ⚠️ Transfer should have failed!\n');
    } catch (error) {
      console.log(`✅ Transfer blocked: ${error.message}\n`);
    }

    // 9. Test downvote
    console.log('👎 Testing downvote...');
    const beforePoints = user2Updated.points;
    await rewardService.handleDownvote(answer._id);
    user2Updated = await User.findById(user2._id);
    console.log(`✅ Downvote applied. Points: ${beforePoints} → ${user2Updated.points} (-1)\n`);

    // 10. Get final stats
    console.log('📊 Final Statistics:');
    console.log('═══════════════════════════════════════');
    
    const allUsers = await User.find().select('username points badges');
    for (const user of allUsers) {
      console.log(`\n👤 ${user.username}:`);
      console.log(`   Points: ${user.points}`);
      console.log(`   Badges: ${user.badges.length > 0 ? user.badges.map(b => b.name).join(', ') : 'None'}`);
    }

    const totalQuestions = await Question.countDocuments();
    const totalAnswers = await Answer.countDocuments();
    console.log(`\n📈 Platform Stats:`);
    console.log(`   Total Questions: ${totalQuestions}`);
    console.log(`   Total Answers: ${totalAnswers}`);

    console.log('\n✅ All tests completed successfully! 🎉\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run tests
testCompleteFlow();
