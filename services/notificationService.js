const Notification = require('../models/Notification');

class NotificationService {
  async createNotification(userId, type, message, data = {}) {
    return await Notification.create({
      userId,
      type,
      message,
      data,
      read: false
    });
  }

  async notifyAnswerReceived(questionOwnerId, answererName, questionTitle) {
    return this.createNotification(
      questionOwnerId,
      'answer',
      `${answererName} answered your question: "${questionTitle}"`,
      { type: 'answer' }
    );
  }

  async notifyUpvote(answerId, answerOwnerId, upvoterName) {
    return this.createNotification(
      answerOwnerId,
      'upvote',
      `${upvoterName} upvoted your answer!`,
      { answerId }
    );
  }

  async notifyPointsReceived(userId, points, fromUserName) {
    return this.createNotification(
      userId,
      'points_received',
      `You received ${points} points from ${fromUserName}!`,
      { points }
    );
  }

  async notifyBadgeEarned(userId, badgeName) {
    return this.createNotification(
      userId,
      'badge',
      `🎉 You earned the "${badgeName}" badge!`,
      { badgeName }
    );
  }

  async getUserNotifications(userId, limit = 20) {
    return await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  async markAsRead(notificationId) {
    return await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );
  }

  async markAllAsRead(userId) {
    return await Notification.updateMany(
      { userId, read: false },
      { read: true }
    );
  }

  async getUnreadCount(userId) {
    return await Notification.countDocuments({ userId, read: false });
  }
}

module.exports = new NotificationService();
