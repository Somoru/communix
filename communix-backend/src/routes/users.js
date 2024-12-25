const express = require('express');
const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');
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
    console.error("Authentication error:", err);
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

// View Profile endpoint
router.get('/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Received userId:", userId);
    console.log("Authorization header:", req.header('Authorization'));
    console.log("Decoded user ID:", req.user.userId);

    // Connect to MongoDB
    await client.connect();
    const db = client.db(databaseId);
    const usersCollection = db.collection('Users');

    const user = await usersCollection.findOne({ userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ error: 'Failed to fetch user' });
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
});

// Edit Profile endpoint
router.put('/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const updatedData = req.body;

    // Connect to MongoDB
    await client.connect();
    const db = client.db(databaseId);
    const usersCollection = db.collection('Users');

    const user = await usersCollection.findOne({ userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update the user object
    const updatedUser = { ...user, ...updatedData };

    await usersCollection.updateOne({ userId }, { $set: updatedUser });
    res.json(updatedUser);

  } catch (err) {
    console.error("Error updating user profile:", err);
    res.status(500).json({ error: 'Failed to update user' });
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
});

// Change Password endpoint
router.post('/:userId/change-password', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Connect to MongoDB
    await client.connect();
    const db = client.db(databaseId);
    const usersCollection = db.collection('Users');

    const user = await usersCollection.findOne({ userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid current password' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await usersCollection.updateOne({ userId }, { $set: { password: hashedPassword } });
    res.json({ message: 'Password changed successfully' });

  } catch (err) {
    console.error("Error changing password:", err);
    res.status(500).json({ error: 'Failed to change password' });
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
});

// Deactivate Account endpoint (soft delete)
router.delete('/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Connect to MongoDB
    await client.connect();
    const db = client.db(databaseId);
    const usersCollection = db.collection('Users');

    const user = await usersCollection.findOne({ userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Soft delete: Set isActive to false
    await usersCollection.updateOne({ userId }, { $set: { isActive: false } });

    res.json({ message: 'Account deactivated' });

  } catch (err) {
    console.error("Error deactivating account:", err);
    res.status(500).json({ error: 'Failed to deactivate account' });
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
});

module.exports = router;