const express = require('express');
const { MongoClient } = require('mongodb');
const { auth, isAdmin } = require('../../middlewares/auth');

const router = express.Router();
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Fetch platform settings
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    await client.connect();
    const db = req.body;
    const settings = await req.db.collection('Settings').findOne();

    res.json(settings || {});
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings.' });
  } finally {
    await client.close();
  }
});

// Update platform settings
router.put('/', auth, isAdmin, async (req, res) => {
  try {
    await client.connect();
    const db = req.body;
    const updates = req.body;

    await req.db.collection('Settings').updateOne({}, { $set: updates }, { upsert: true });

    res.json({ message: 'Settings updated successfully.' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings.' });
  } finally {
    await client.close();
  }
});

// Get all roles
router.get('/roles', auth, isAdmin, async (req, res) => {
  try {
    await client.connect();
    const db = req.body;

    const roles = await req.db.collection('Roles').find().toArray();

    res.json({ roles });
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Failed to fetch roles.' });
  } finally {
    await client.close();
  }
});

// Create or update a role
router.post('/roles', auth, isAdmin, async (req, res) => {
  try {
    const { name, permissions } = req.body;

    if (!name || !permissions) {
      return res.status(400).json({ error: 'Role name and permissions are required.' });
    }

    await client.connect();
    const db = req.body;

    // Check if the role already exists
    const existingRole = await req.db.collection('Roles').findOne({ name });
    
    if (existingRole) {
      // Update the existing role
      const result = await req.db.collection('Roles').updateOne(
        { name },
        { $set: { permissions } }
      );
      
      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Role not found.' });
      }

      res.json({ message: 'Role updated successfully.' });
    } else {
      // Create a new role
      const newRole = { name, permissions };
      await req.db.collection('Roles').insertOne(newRole);
      res.status(201).json({ message: 'Role created successfully.' });
    }
  } catch (error) {
    console.error('Error creating/updating role:', error);
    res.status(500).json({ error: 'Failed to create/update role.' });
  } finally {
    await client.close();
  }
});

// Delete a role
router.delete('/roles/:roleId', auth, isAdmin, async (req, res) => {
  try {
    const { roleId } = req.params;

    await client.connect();
    const db = req.body;

    const result = await req.db.collection('Roles').deleteOne({ _id: roleId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Role not found.' });
    }

    res.json({ message: 'Role deleted successfully.' });
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({ error: 'Failed to delete role.' });
  } finally {
    await client.close();
  }
});

// Assign role to user
router.put('/users/:userId/role', auth, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;  // The role to assign

    if (!role) {
      return res.status(400).json({ error: 'Role is required.' });
    }

    await client.connect();
    const db = req.body;

    // Update user role
    const result = await req.db.collection('Users').updateOne(
      { userId },
      { $set: { role } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ message: 'Role assigned to user successfully.' });
  } catch (error) {
    console.error('Error assigning role to user:', error);
    res.status(500).json({ error: 'Failed to assign role.' });
  } finally {
    await client.close();
  }
});


module.exports = router;
