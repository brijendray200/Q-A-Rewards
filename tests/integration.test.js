const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Question = require('../models/Question');
const Answer = require('../models/Answer');

describe('Integration Tests - Complete Flow', () => {
  let user1, user2, question, answer;

  beforeAll(async () => {
    // Create test users
    user1 = await User.create({
      username: 'alice',
      email: 'alice@example.com',
      points: 0
    });

    user2 = await User.create({
      username: 'bob',
      email: 'bob@example.com',
      points: 0
    });
  });

  test('Complete Q&A flow with rewards', async () => {
    // 1. User1 creates a question
    const questionRes = await request(app)
      .post('/api/questions')
      .set('x-user-id', user1._id.toString())
      .send({
        title: 'How to use async/await?',
        content: 'I am confused about async/await in JavaScript',
        tags: ['javascript', 'async']
      });
    
    expect(questionRes.status).toBe(201);
    question = questionRes.body;

    // 2. User2 answers the question (gets 5 points)
    const answerRes = await request(app)
      .post(`/api/questions/${question._id}/answers`)
      .set('x-user-id', user2._id.toString())
      .send({
        content: 'Async/await is syntactic sugar for promises...'
      });
    
    expect(answerRes.status).toBe(201);
    answer = answerRes.body;

    // Check user2 got 5 points
    let user2Updated = await User.findById(user2._id);
    expect(user2Updated.points).toBe(5);

    // 3. Upvote the answer 5 times (user2 gets 5 bonus points)
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post(`/api/rewards/answer/${answer._id}/upvote`)
        .set('x-user-id', user1._id.toString());
    }

    user2Updated = await User.findById(user2._id);
    expect(user2Updated.points).toBe(10); // 5 + 5 bonus

    // 4. User2 transfers 5 points to User1
    const transferRes = await request(app)
      .post('/api/rewards/transfer')
      .set('x-user-id', user2._id.toString())
      .send({
        toUserId: user1._id.toString(),
        points: 5
      });
    
    expect(transferRes.status).toBe(200);

    user2Updated = await User.findById(user2._id);
    const user1Updated = await User.findById(user1._id);
    
    expect(user2Updated.points).toBe(5);
    expect(user1Updated.points).toBe(5);
  });

  test('Cannot transfer with less than 10 points', async () => {
    const res = await request(app)
      .post('/api/rewards/transfer')
      .set('x-user-id', user2._id.toString())
      .send({
        toUserId: user1._id.toString(),
        points: 3
      });
    
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('at least 10 points');
  });

  test('Leaderboard shows top users', async () => {
    const res = await request(app)
      .get('/api/leaderboard/top-users?limit=5');
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('Search questions by keyword', async () => {
    const res = await request(app)
      .get('/api/questions/search?q=async')
      .set('x-user-id', user1._id.toString());
    
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });
});
