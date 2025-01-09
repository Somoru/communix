const express = require('express');
const { MongoClient } = require('mongodb');
const { auth, isAdmin } = require('../../middlewares/auth');

const router = express.Router();
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Get recent activity (registrations, join requests, new posts, reports)
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    await client.connect();
    const db = req.db;

    const recentRegistrations = await req.db.collection('Users').find()
      .sort({ createdAt: -1 })
      .limit(5)  // Get the last 5 user registrations
      .toArray();

    const recentJoinRequests = await req.db.collection('JoinRequests').find()
      .sort({ createdAt: -1 })
      .limit(5)  // Get the last 5 join requests
      .toArray();

    const recentPosts = await req.db.collection('Posts').find()
      .sort({ createdAt: -1 })
      .limit(5)  // Get the last 5 posts
      .toArray();

    const recentReports = await req.db.collection('Reports').find()
      .sort({ createdAt: -1 })
      .limit(5)  // Get the last 5 reports
      .toArray();

    res.json({
      recentRegistrations,
      recentJoinRequests,
      recentPosts,
      recentReports
    });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ error: 'Failed to fetch recent activity.' });
  } finally {
    await client.close();
  }
});

module.exports = router;
