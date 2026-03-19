const mongoose = require('mongoose');
const User = require('../models/User');
const Question = require('../models/Question');
require('dotenv').config();

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await User.deleteMany({});
  await Question.deleteMany({});

  // Create users
  const users = await User.insertMany([
    { username: 'alice', email: 'alice@example.com', points: 50, badges: [] },
    { username: 'bob', email: 'bob@example.com', points: 30, badges: [] },
    { username: 'charlie', email: 'charlie@example.com', points: 20, badges: [] },
    { username: 'diana', email: 'diana@example.com', points: 15, badges: [] },
    { username: 'eve', email: 'eve@example.com', points: 10, badges: [] }
  ]);

  console.log('Users created:', users.map(u => u.username));

  // Create sample questions
  await Question.insertMany([
    {
      userId: users[0]._id,
      title: 'How to use async/await in JavaScript?',
      content: 'I need help understanding async/await syntax and how it works with promises.',
      tags: ['javascript', 'async', 'promises']
    },
    {
      userId: users[1]._id,
      title: 'What is the difference between let and const?',
      content: 'Can someone explain when to use let vs const in modern JavaScript?',
      tags: ['javascript', 'es6']
    },
    {
      userId: users[2]._id,
      title: 'How to center a div in CSS?',
      content: 'I have been struggling to center a div both horizontally and vertically.',
      tags: ['css', 'html', 'flexbox']
    }
  ]);

  console.log('Sample questions created!');
  console.log('Seed completed successfully!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
