const express = require('express');
const { MongoClient } = require('mongodb');
const { auth, isAdmin } = require('../../middlewares/auth');

const router = express.Router();
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Fetch users with pagination, sorting, and filtering
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'createdAt:desc',search, role, profession, isActive } = req.query;
    const db = req.db;

    const filters = {};
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) filters.role = role;
    if (profession) filters.profession = profession;
    if (isActive) filters.isActive = isActive === 'true';

    const [sortField, sortOrder] = sort.split(':');
    const options = {
      skip: (parseInt(page) - 1) * parseInt(limit),
      limit: parseInt(limit),
      sort: { [sortField]: sortOrder === 'desc' ? -1 : 1 },
    };

    const users = await req.db.collection('Users').find(filters, options).toArray();
    const total = await req.db.collection('Users').countDocuments(filters);

    res.json({ users, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});



// View user profile
router.get('/:userId', auth, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    await client.connect();
    const db = req.db;
    const user = await req.db.collection('Users').findOne({ userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
});


// View user activity
router.get('/:userId/activity', auth, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    await client.connect();
    const db = req.body;
    
    const activity = await req.db.collection('Activities').find({ userId }).toArray();
    res.json({ activity });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({ error: 'Failed to fetch user activity.' });
  }
});


// Assign role to user
router.put('/:userId/role', auth, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    

    await client.connect();
    const db = req.body;

    const result = await req.db.collection('Users').updateOne(
      { userId },
      { $set: { role } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Role updated successfully' });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role.' });
  }
});


// Update a user
router.put('/:userId', auth, isAdmin, async (req, res) => {
  try {
    await client.connect();
    const db = req.body;
    const { userId } = req.params;
    const updates = req.body;

    delete updates._id; // Remove _id field if present

    const result = await req.db.collection('Users').updateOne(
      { userId },
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user.' });
  }
});

// Deactivate user
router.put('/:userId/deactivate', auth, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    await client.connect();
    const db = req.body;

    const result = await req.db.collection('Users').updateOne(
      { userId },
      { $set: { isActive: false } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating user:', error);
    res.status(500).json({ error: 'Failed to deactivate user.' });
  }
});

// Ban user
router.put('/:userId/ban', auth, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    await client.connect();
    const db = req.body;

    const result = await req.db.collection('Users').updateOne(
      { userId },
      { $set: { isActive: false, banned: true } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User banned successfully' });
  } catch (error) {
    console.error('Error banning user:', error);
    res.status(500).json({ error: 'Failed to ban user.' });
  }
});



// Delete a user (soft delete)
router.delete('/:userId', auth, isAdmin, async (req, res) => {
  try {
    await client.connect();
    const db = req.body;
    const { userId } = req.params;

    const result = await req.db.collection('Users').updateOne(
      { userId },
      { $set: { isActive: false } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating user:', error);
    res.status(500).json({ error: 'Failed to deactivate user.' });
  }
});

module.exports = router;
