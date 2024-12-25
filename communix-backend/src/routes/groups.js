// groups.js

const express = require('express');
const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

const router = express.Router();
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Authentication middleware
const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

// Create Group Chat endpoint
router.post('/', auth, async (req, res) => {
  try {
    const { name, members } = req.body;
    const admin = req.user.userId;

    // Validation for group chat data
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Invalid group name' });
    }
    if (!members || !Array.isArray(members)) {
      return res.status(400).json({ error: 'Invalid members list' });
    }

    const newGroupChat = {
      chatId: uuidv4(),
      name,
      admin,
      members: [admin, ...members],
      createdAt: new Date()
    };

    // Connect to MongoDB
    await client.connect();
    const db = client.db(databaseId);
    const groupsCollection = db.collection('Groups');

    await groupsCollection.insertOne(newGroupChat);

    res.status(201).json(newGroupChat); // Send the newGroupChat in the response

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create group chat' });
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
});

// Get Group Chat Details endpoint
router.get('/:chatId', auth, async (req, res) => {
  try {
    const { chatId } = req.params;

    // Connect to MongoDB
    await client.connect();
    const db = client.db(databaseId);
    const groupsCollection = db.collection('Groups');

    const groupChat = await groupsCollection.findOne({ chatId });

    if (!groupChat) {
      return res.status(404).json({ error: 'Group chat not found' });
    }

    res.json(groupChat);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve group chat' });
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
});

// Update Group Chat endpoint
router.put('/:chatId', auth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const updatedData = req.body;

    // Connect to MongoDB
    await client.connect();
    const db = client.db(process.env.DATABASE_NAME);
    const groupsCollection = db.collection('Groups');

    // ... (Add validation for updatedData if needed) ...

    let groupChat = await groupsCollection.findOne({ chatId });

    if (!groupChat) {
      return res.status(404).json({ error: 'Group chat not found' });
    }

    // Check if the user is the admin
    if (req.user.userId !== groupChat.admin) {
      return res.status(403).json({ error: 'Unauthorized to update group chat' });
    }

    // Update the group chat object
    const updatedGroupChat = { ...groupChat, ...updatedData };

    await groupsCollection.updateOne({ chatId }, { $set: updatedGroupChat });
    res.json(updatedGroupChat);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update group chat' });
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
});

// Delete Group Chat endpoint
router.delete('/:chatId', auth, async (req, res) => {
  try {
    const { chatId } = req.params;

    // Connect to MongoDB
    await client.connect();
    const db = client.db(process.env.DATABASE_NAME);
    const groupsCollection = db.collection('Groups');

    const groupChat = await groupsCollection.findOne({ chatId });

    if (!groupChat) {
      return res.status(404).json({ error: 'Group chat not found' });
    }

    // Check if the user is the admin
    if (req.user.userId !== groupChat.admin) {
      return res.status(403).json({ error: 'Unauthorized to delete group chat' });
    }

    await groupsCollection.deleteOne({ chatId });
    res.json({ message: 'Group chat deleted' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete group chat' });
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
});

// Add Member endpoint
router.post('/:chatId/members', auth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { userId } = req.body; // Assuming you send the userId to add

    // Validation
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    await client.connect();
    const db = client.db(process.env.DATABASE_NAME);
    const groupsCollection = db.collection('Groups');

    const groupChat = await groupsCollection.findOne({ chatId });

    if (!groupChat) {
      return res.status(404).json({ error: 'Group chat not found' });
    }

    // Check if the user is the admin
    if (req.user.userId !== groupChat.admin) {
      return res.status(403).json({ error: 'Unauthorized to add member' });
    }

    // Check if the user is already a member
    if (groupChat.members.includes(userId)) {
      return res.status(400).json({ error: 'User is already a member of this group' });
    }

    // Add the member to the group
    const updatedGroupChat = await groupsCollection.findOneAndUpdate(
      { chatId },
      { $push: { members: userId } },
      { returnOriginal: false }
    );

    res.json(updatedGroupChat.value);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add member to group chat' });
  } finally {
    await client.close();
  }
});

// Remove Member endpoint
router.delete('/:chatId/members/:userId', auth, async (req, res) => {
  try {
    const { chatId, userId } = req.params;

    await client.connect();
    const db = client.db(process.env.DATABASE_NAME);
    const groupsCollection = db.collection('Groups');

    const groupChat = await groupsCollection.findOne({ chatId });

    if (!groupChat) {
      return res.status(404).json({ error: 'Group chat not found' });
    }

    // Check if the user is the admin
    if (req.user.userId !== groupChat.admin) {
      return res.status(403).json({ error: 'Unauthorized to remove member' });
    }

    // Check if the user is a member of the group
    if (!groupChat.members.includes(userId)) {
      return res.status(400).json({ error: 'User is not a member of this group' });
    }

    // Remove the member from the group
    const updatedGroupChat = await groupsCollection.findOneAndUpdate(
      { chatId },
      { $pull: { members: userId } },
      { returnOriginal: false }
    );

    res.json(updatedGroupChat.value);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove member from group chat' });
  } finally {
    await client.close();
  }
});
// ... (Add/Remove Members endpoints) ...

module.exports = router;