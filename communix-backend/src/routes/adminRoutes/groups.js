const express = require('express');
const { MongoClient } = require('mongodb');
const { auth, isAdmin } = require('../../middlewares/auth');

const router = express.Router();
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Fetch all groups
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    await client.connect();
    const db = req.body;
    const { communityId } = req.query;

    const filters = {};
    if (communityId) filters.communityId = communityId;

    const groups = await req.db.collection('Groups').find(filters).toArray();
    res.json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: 'Failed to fetch groups.' });
  } finally {
    await client.close();
  }
});

// Create a new group
router.post('/', auth, isAdmin, async (req, res) => {
  try {
    const { communityId, name, description } = req.body;

    if (!communityId || !name) {
      return res.status(400).json({ error: 'Community ID and group name are required.' });
    }

    await client.connect();
    const db = req.body;

    const newGroup = {
      groupId: uuidv4(),
      communityId,
      name,
      description,
      members: [],
      createdAt: new Date(),
    };

    await req.db.collection('Groups').insertOne(newGroup);

    res.status(201).json({ message: 'Group created successfully', group: newGroup });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Failed to create group.' });
  } finally {
    await client.close();
  }
});

// Get detailed group information
router.get('/:groupId', auth, isAdmin, async (req, res) => {
  try {
    const { groupId } = req.params;

    await client.connect();
    const db = req.body;

    // Fetch group details
    const group = await req.db.collection('Groups').findOne({ groupId });

    if (!group) {
      return res.status(404).json({ error: 'Group not found.' });
    }

    // Optionally fetch chat history (if applicable)
    const chatHistory = await req.db.collection('Chats')
      .find({ groupId })
      .sort({ createdAt: -1 }) // Sort by most recent messages
      .limit(20) // Limit to the last 20 messages
      .toArray();

    res.json({ group, chatHistory });
  } catch (error) {
    console.error('Error fetching group details:', error);
    res.status(500).json({ error: 'Failed to fetch group details.' });
  } finally {
    await client.close();
  }
});




// Edit group details
router.put('/:groupId', auth, isAdmin, async (req, res) => {
  try {
    const { groupId } = req.params;
    const updates = req.body;

    // Validate required fields
    if (!updates.name && !updates.description) {
      return res.status(400).json({ error: 'At least name or description is required.' });
    }

    await client.connect();
    const db = req.body;

    const result = await req.db.collection('Groups').updateOne(
      { groupId },
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json({ message: 'Group updated successfully' });
  } catch (error) {
    console.error('Error updating group:', error);
    res.status(500).json({ error: 'Failed to update group.' });
  } finally {
    await client.close();
  }
});



// Delete a group
router.delete('/:groupId', auth, isAdmin, async (req, res) => {
  try {
    const { groupId } = req.params;
    await client.connect();
    const db = req.body;

    const result = await req.db.collection('Groups').deleteOne({ groupId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({ error: 'Failed to delete group.' });
  } finally {
    await client.close();
  }
});



// Add or remove group members
router.post('/:groupId/members', auth, isAdmin, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId, action } = req.body;  // action: 'add' or 'remove'

    if (!userId || !action) {
      return res.status(400).json({ error: 'User ID and action (add/remove) are required.' });
    }

    const update =
      action === 'add' ? { $addToSet: { members: userId } } : { $pull: { members: userId } };

    await client.connect();
    const db = req.body;

    const result = await req.db.collection('Groups').updateOne({ groupId }, update);

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json({ message: `Member ${action}ed successfully.` });
  } catch (error) {
    console.error('Error managing group members:', error);
    res.status(500).json({ error: 'Failed to manage group members.' });
  } finally {
    await client.close();
  }
});



module.exports = router;
