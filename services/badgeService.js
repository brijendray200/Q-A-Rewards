const User = require('../models/User');
const Answer = require('../models/Answer');

class BadgeService {
  async checkAndAwardBadges(userId) {
    const user = await User.findById(userId);
    const answers = await Answer.find({ userId });

    const badges = [];

    // First Answer Badge
    if (answers.length === 1 && !this.hasBadge(user, 'First Answer')) {
      badges.push({ name: 'First Answer', earnedAt: new Date() });
    }

    // Helpful Badge - 10 answers
    if (answers.length >= 10 && !this.hasBadge(user, 'Helpful')) {
      badges.push({ name: 'Helpful', earnedAt: new Date() });
    }

    // Expert Badge - 50 answers
    if (answers.length >= 50 && !this.hasBadge(user, 'Expert')) {
      badges.push({ name: 'Expert', earnedAt: new Date() });
    }

    // Popular Answer Badge - any answer with 10+ upvotes
    const popularAnswer = answers.find(a => a.upvotes >= 10);
    if (popularAnswer && !this.hasBadge(user, 'Popular Answer')) {
      badges.push({ name: 'Popular Answer', earnedAt: new Date() });
    }

    // Point Millionaire Badge - 1000+ points
    if (user.points >= 1000 && !this.hasBadge(user, 'Point Millionaire')) {
      badges.push({ name: 'Point Millionaire', earnedAt: new Date() });
    }

    // Generous Badge - transferred points 5+ times
    if (!this.hasBadge(user, 'Generous')) {
      const PointTransaction = require('../models/PointTransaction');
      const transfers = await PointTransaction.countDocuments({
        fromUser: userId,
        type: 'transfer'
      });
      if (transfers >= 5) {
        badges.push({ name: 'Generous', earnedAt: new Date() });
      }
    }

    if (badges.length > 0) {
      await User.findByIdAndUpdate(userId, {
        $push: { badges: { $each: badges } }
      });
    }

    return badges;
  }

  hasBadge(user, badgeName) {
    return user.badges.some(b => b.name === badgeName);
  }
}

module.exports = new BadgeService();
