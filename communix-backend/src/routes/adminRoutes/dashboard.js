const express = require('express');
const { MongoClient } = require('mongodb');
const { auth, isAdmin } = require('../../middlewares/auth');

const router = express.Router();
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
let db;

// Initialize the database connection once
async function initializeDb() {
  if (!db) {
    await client.connect();
    db = client.db('communix-db');
    console.log('Database connected');
  }
}

// Dashboard Metrics
router.get('/metrics', auth, isAdmin, async (req, res) => {
  try {
    await initializeDb();

    const [totalUsers, activeUsers, bannedUsers] = await Promise.all([
      db.collection('Users').countDocuments(),
      db.collection('Users').countDocuments({ isActive: true }),
      db.collection('Users').countDocuments({ isActive: false }),
    ]);

    const [totalCommunities, publicCommunities, privateCommunities] = await Promise.all([
      db.collection('Communities').countDocuments(),
      db.collection('Communities').countDocuments({ privacy: 'public' }),
      db.collection('Communities').countDocuments({ privacy: 'private' }),
    ]);

    const newPosts = await req.db.collection('Posts').countDocuments({
      createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 1)) },
    });

    const pendingRequests = await req.db.collection('JoinRequests').countDocuments({ status: 'pending' });

    const reportedPosts = await req.db.collection('Reports').countDocuments();

    res.json({
      totalUsers,
      activeUsers,
      bannedUsers,
      totalCommunities,
      publicCommunities,
      privateCommunities,
      newPosts,
      pendingRequests,
      reportedPosts,
    });
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    res.status(500).json({ error: 'Failed to fetch metrics.' });
  }
});

// User Growth (Visualizations)
router.get('/user-growth', auth, isAdmin, async (req, res) => {
  try {
    await initializeDb();

    const userGrowth = await req.db.collection('Users').aggregate([
      {
        $match: { createdAt: { $type: 'date' } }, // Ensure createdAt is a valid date
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]).toArray();

    res.json(userGrowth);
  } catch (error) {
    console.error('Error fetching user growth:', error);
    res.status(500).json({ error: 'Failed to fetch user growth.' });
  }
});

// Post Frequency (Visualizations)
router.get('/post-frequency', auth, isAdmin, async (req, res) => {
  try {
    await initializeDb();

    const postFrequency = await req.db.collection('Posts').aggregate([
      {
        $match: { createdAt: { $type: 'date' } }, // Ensure createdAt is a valid date
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]).toArray();

    res.json(postFrequency);
  } catch (error) {
    console.error('Error fetching post frequency:', error);
    res.status(500).json({ error: 'Failed to fetch post frequency.' });
  }
});

module.exports = router;
