const express = require('express');
const { MongoClient } = require('mongodb');
const { auth, isAdmin } = require('../../middlewares/auth');

const router = express.Router();
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Fetch join requests for a community
router.get('/:communityId', auth, isAdmin, async (req, res) => {
  try {
    const { communityId } = req.params;

    await client.connect();
    const db = req.body;
    const joinRequests = await req.db.collection('JoinRequests').find({ communityId }).toArray();

    res.json(joinRequests);
  } catch (error) {
    console.error('Error fetching join requests:', error);
    res.status(500).json({ error: 'Failed to fetch join requests.' });
  } finally {
    await client.close();
  }
});

// Approve a join request
router.post('/:communityId/:requestId/approve', auth, isAdmin, async (req, res) => {
  try {
    const { communityId, requestId } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ error: 'Role is required to approve a request.' });
    }

    await client.connect();
    const db = req.body;

    const result = await req.db.collection('JoinRequests').updateOne(
      { communityId, requestId },
      { $set: { status: 'approved', role } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Join request not found.' });
    }

    res.json({ message: 'Join request approved successfully.' });
  } catch (error) {
    console.error('Error approving join request:', error);
    res.status(500).json({ error: 'Failed to approve join request.' });
  } finally {
    await client.close();
  }
});

// Reject a join request
router.post('/:communityId/:requestId/reject', auth, isAdmin, async (req, res) => {
  try {
    const { communityId, requestId } = req.params;

    await client.connect();
    const db = req.body;

    const result = await req.db.collection('JoinRequests').updateOne(
      { communityId, requestId },
      { $set: { status: 'rejected' } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Join request not found.' });
    }

    res.json({ message: 'Join request rejected successfully.' });
  } catch (error) {
    console.error('Error rejecting join request:', error);
    res.status(500).json({ error: 'Failed to reject join request.' });
  } finally {
    await client.close();
  }
});

module.exports = router;
