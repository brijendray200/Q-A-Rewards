# Q&A Platform with Reward System 🏆

Complete Q&A platform with comprehensive reward system, badges, and leaderboard.

## Features

### Reward System
- **Answer Rewards**: 5 points per answer
- **Upvote Bonuses**: 5 points for every 5 upvotes
- **Point Transfers**: Transfer points to other users (minimum 10 points required)
- **Point Deductions**: -1 point for downvotes, full deduction on answer deletion
- **Transaction History**: Track all point movements

### Badge System
- 🥇 **First Answer**: Post your first answer
- 🤝 **Helpful**: Answer 10 questions
- 🎓 **Expert**: Answer 50 questions
- ⭐ **Popular Answer**: Get 10+ upvotes on an answer
- 💰 **Point Millionaire**: Reach 1000 points
- 💝 **Generous**: Transfer points 5+ times

### Leaderboard
- Top users by points
- Top answerers by answer count
- User statistics and achievements

## API Endpoints

### Questions
```
POST   /api/questions              - Create question
GET    /api/questions              - Get all questions
GET    /api/questions/search       - Search questions
GET    /api/questions/:id          - Get question with answers
POST   /api/questions/:id/answers  - Answer a question
```

### Rewards
```
GET    /api/rewards/profile/:userId           - Get user profile
POST   /api/rewards/transfer                  - Transfer points
POST   /api/rewards/answer/:answerId/upvote   - Upvote answer
POST   /api/rewards/answer/:answerId/downvote - Downvote answer
DELETE /api/rewards/answer/:answerId          - Delete answer
```

### Leaderboard
```
GET /api/leaderboard/top-users              - Top users by points
GET /api/leaderboard/top-answerers          - Top answerers
GET /api/leaderboard/user/:userId/stats     - User statistics
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your MongoDB URI
```

3. Start server:
```bash
npm start        # Production
npm run dev      # Development with nodemon
```

4. Run tests:
```bash
npm test
```

## Point Rules

| Action | Points |
|--------|--------|
| Answer question | +5 |
| Every 5 upvotes | +5 |
| Downvote received | -1 |
| Answer deleted | -All earned from that answer |
| Transfer minimum | 10 points required |

## Authentication

Add `x-user-id` header to authenticated requests:
```
x-user-id: <userId>
```

## Example Usage

### Create Question
```bash
curl -X POST http://localhost:3000/api/questions \
  -H "Content-Type: application/json" \
  -H "x-user-id: USER_ID" \
  -d '{
    "title": "How to use async/await?",
    "content": "I need help understanding async/await",
    "tags": ["javascript", "async"]
  }'
```

### Answer Question
```bash
curl -X POST http://localhost:3000/api/questions/QUESTION_ID/answers \
  -H "Content-Type: application/json" \
  -H "x-user-id: USER_ID" \
  -d '{
    "content": "Async/await is syntactic sugar for promises..."
  }'
```

### Transfer Points
```bash
curl -X POST http://localhost:3000/api/rewards/transfer \
  -H "Content-Type: application/json" \
  -H "x-user-id: USER_ID" \
  -d '{
    "toUserId": "RECIPIENT_ID",
    "points": 15
  }'
```

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- Jest + Supertest (testing)

## Project Structure

```
├── controllers/       # Request handlers
├── models/           # Database schemas
├── routes/           # API routes
├── services/         # Business logic
├── middleware/       # Auth & validation
├── tests/            # Test suites
└── server.js         # Entry point
```
