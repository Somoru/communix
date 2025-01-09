const express = require('express');
const { MongoClient } = require('mongodb');
const { auth, isAdmin } = require('../../middlewares/auth');

const router = express.Router();
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Fetch all reported posts
router.get('/reports', auth, isAdmin, async (req, res) => {
  try {
    await client.connect();
    const db = req.body;

    const reports = await req.db.collection('Reports').aggregate([
      {
        $lookup: {
          from: 'Posts',
          localField: 'postId',
          foreignField: 'postId',
          as: 'postDetails',
        },
      },
      {
        $unwind: '$postDetails',
      },
      {
        $lookup: {
          from: 'Users',
          localField: 'reportedBy',
          foreignField: 'userId',
          as: 'reporterDetails',
        },
      },
      {
        $unwind: '$reporterDetails',
      },
      {
        $project: {
          reportId: 1,
          postId: 1,
          reason: 1,
          reportedAt: 1,
          postDetails: { content: 1, createdAt: 1 },
          reporterDetails: { name: 1, email: 1 },
        },
      },
    ]).toArray();

    res.json(reports);
  } catch (error) {
    console.error('Error fetching reported posts:', error);
    res.status(500).json({ error: 'Failed to fetch reported posts.' });
  } finally {
    await client.close();
  }
});

// Moderate a reported post
router.post('/reports/:reportId/action', auth, isAdmin, async (req, res) => {
  try {
    await client.connect();
    const db = req.body;
    const { reportId } = req.params;
    const { action, warningMessage } = req.body;

    const report = await req.db.collection('Reports').findOne({ reportId });

    if (!report) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    if (action === 'delete') {
      // Delete the post
      await req.db.collection('Posts').deleteOne({ postId: report.postId });
      await req.db.collection('Reports').deleteOne({ reportId });
      return res.json({ message: 'Post deleted successfully.' });
    }

    if (action === 'warn') {
      // Warn the user
      const userId = report.reportedBy;
      await req.db.collection('Warnings').insertOne({
        userId,
        warningMessage,
        issuedAt: new Date(),
      });
      return res.json({ message: 'User warned successfully.' });
    }

    if (action === 'ban') {
      // Ban the user
      const userId = report.reportedBy;
      await req.db.collection('Users').updateOne(
        { userId },
        { $set: { isActive: false } }
      );
      return res.json({ message: 'User banned successfully.' });
    }

    res.status(400).json({ error: 'Invalid action.' });
  } catch (error) {
    console.error('Error moderating reported post:', error);
    res.status(500).json({ error: 'Failed to moderate reported post.' });
  } finally {
    await client.close();
  }
});

// Edit post content
router.put('/reports/:reportId/edit', auth, isAdmin, async (req, res) => {
  try {
    const { reportId } = req.params;
    const { newContent } = req.body;

    if (!newContent) {
      return res.status(400).json({ error: 'New content is required.' });
    }

    await client.connect();
    const db = req.body;
    
    // Find the post that is being reported
    const report = await req.db.collection('Reports').findOne({ reportId });
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    // Update the post content
    const result = await req.db.collection('Posts').updateOne(
      { postId: report.postId },
      { $set: { content: newContent } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    res.json({ message: 'Post content updated successfully.' });
  } catch (error) {
    console.error('Error editing post content:', error);
    res.status(500).json({ error: 'Failed to edit post content.' });
  } finally {
    await client.close();
  }
});


module.exports = router;
