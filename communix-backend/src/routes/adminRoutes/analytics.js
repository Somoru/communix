const express = require('express');
const { MongoClient } = require('mongodb');
const { auth, isAdmin } = require('../../middlewares/auth');
const json2csv = require('json2csv').parse;
const fs = require('fs');

const router = express.Router();
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// User growth analytics
router.get('/users', auth, isAdmin, async (req, res) => {
  try {
    await client.connect();
    const db = req.body;

    const userGrowth = await req.db.collection('Users').aggregate([
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
    console.error('Error fetching user growth analytics:', error);
    res.status(500).json({ error: 'Failed to fetch user growth analytics.' });
  } finally {
    await client.close();
  }
});

// Community engagement analytics
router.get('/communities', auth, isAdmin, async (req, res) => {
  try {
    await client.connect();
    const db = req.body;

    const communityEngagement = await req.db.collection('Communities').aggregate([
      {
        $lookup: {
          from: 'Posts',
          localField: 'communityId',
          foreignField: 'communityId',
          as: 'posts',
        },
      },
      {
        $project: {
          name: 1,
          postCount: { $size: '$posts' },
        },
      },
    ]).toArray();

    res.json(communityEngagement);
  } catch (error) {
    console.error('Error fetching community engagement analytics:', error);
    res.status(500).json({ error: 'Failed to fetch community engagement analytics.' });
  } finally {
    await client.close();
  }
});

// Content engagement analytics
router.get('/content', auth, isAdmin, async (req, res) => {
  try {
    await client.connect();
    const db = req.body;

    const contentEngagement = await req.db.collection('Posts').aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          postCount: { $sum: 1 },
          commentCount: { $sum: '$commentsCount' },
          likeCount: { $sum: '$likesCount' },
        },
      },
      { $sort: { _id: 1 } },
    ]).toArray();

    res.json(contentEngagement);
  } catch (error) {
    console.error('Error fetching content engagement analytics:', error);
    res.status(500).json({ error: 'Failed to fetch content engagement analytics.' });
  } finally {
    await client.close();
  }
});

// User activity analytics - Tracks activity like posts, comments, and likes
router.get('/user-activity', auth, isAdmin, async (req, res) => {
  try {
    await client.connect();
    const db = req.body;

    const userActivity = await req.db.collection('Activities').aggregate([
      {
        $group: {
          _id: '$userId',
          totalPosts: { $sum: 1 },
          totalComments: { $sum: { $size: '$comments' } },
          totalLikes: { $sum: { $size: '$likes' } },
        },
      },
    ]).toArray();

    res.json(userActivity);
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({ error: 'Failed to fetch user activity.' });
  } finally {
    await client.close();
  }
});

// Export user activity to CSV
router.get('/export-user-activity', auth, isAdmin, async (req, res) => {
  try {
    await client.connect();
    const db = req.body;

    const userActivity = await req.db.collection('Activities').aggregate([
      {
        $group: {
          _id: '$userId',
          totalPosts: { $sum: 1 },
          totalComments: { $sum: { $size: '$comments' } },
          totalLikes: { $sum: { $size: '$likes' } },
        },
      },
    ]).toArray();

    const csv = json2csv(userActivity);
    const filePath = 'user_activity_report.csv';

    fs.writeFileSync(filePath, csv);

    res.download(filePath, 'user_activity_report.csv', (err) => {
      if (err) {
        console.error('Error exporting CSV:', err);
        res.status(500).send('Failed to export CSV');
      }
    });
  } catch (error) {
    console.error('Error exporting user activity report:', error);
    res.status(500).json({ error: 'Failed to export user activity report.' });
  } finally {
    await client.close();
  }
});

module.exports = router;
