const express = require('express');
const router = express.Router();
const activityService = require('../services/activityService');

// Get user activity feed
router.get('/user/:userId', async (req, res) => {
  try {
    const activities = await activityService.getUserActivity(req.params.userId);
    res.json(activities);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get global activity feed
router.get('/global', async (req, res) => {
  try {
    const activities = await activityService.getGlobalActivity();
    res.json(activities);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
