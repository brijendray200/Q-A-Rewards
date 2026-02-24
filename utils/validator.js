class Validator {
  static validateQuestion(data) {
    const errors = [];

    if (!data.title || data.title.trim().length < 10) {
      errors.push('Title must be at least 10 characters');
    }

    if (!data.content || data.content.trim().length < 20) {
      errors.push('Content must be at least 20 characters');
    }

    if (!data.tags || !Array.isArray(data.tags) || data.tags.length === 0) {
      errors.push('At least one tag is required');
    }

    return { isValid: errors.length === 0, errors };
  }

  static validateAnswer(data) {
    const errors = [];

    if (!data.content || data.content.trim().length < 10) {
      errors.push('Answer must be at least 10 characters');
    }

    return { isValid: errors.length === 0, errors };
  }

  static validateTransfer(data, userPoints) {
    const errors = [];

    if (!data.toUserId) {
      errors.push('Recipient user ID is required');
    }

    if (!data.points || data.points <= 0) {
      errors.push('Points must be greater than 0');
    }

    if (userPoints < 10) {
      errors.push('You need at least 10 points to transfer');
    }

    if (data.points > userPoints) {
      errors.push('Insufficient points');
    }

    return { isValid: errors.length === 0, errors };
  }

  static sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }
}

module.exports = Validator;
