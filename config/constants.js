module.exports = {
  POINTS: {
    ANSWER: 5,
    UPVOTE_THRESHOLD: 5,
    UPVOTE_BONUS: 5,
    DOWNVOTE_PENALTY: -1,
    TRANSFER_MINIMUM: 10
  },
  
  BADGES: {
    FIRST_ANSWER: { name: 'First Answer', requirement: 1 },
    HELPFUL: { name: 'Helpful', requirement: 10 },
    EXPERT: { name: 'Expert', requirement: 50 },
    POPULAR_ANSWER: { name: 'Popular Answer', upvotes: 10 },
    POINT_MILLIONAIRE: { name: 'Point Millionaire', points: 1000 },
    GENEROUS: { name: 'Generous', transfers: 5 }
  },

  VALIDATION: {
    MIN_QUESTION_TITLE: 10,
    MIN_QUESTION_CONTENT: 20,
    MIN_ANSWER_LENGTH: 10
  }
};
