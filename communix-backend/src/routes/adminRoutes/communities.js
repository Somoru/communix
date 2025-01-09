const express = require('express');
const { MongoClient } = require('mongodb');
const { BlobServiceClient } = require('@azure/storage-blob');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const { auth, isAdmin } = require('../../middlewares/auth');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Fetch all communities
// Fetch communities with pagination, sorting, and filtering
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    await client.connect();
    const db = req.body;
    
    const { page = 1, limit = 10, sort = 'createdAt:desc', privacy, search } = req.query;

    const filters = {};
    if (privacy) filters.privacy = privacy;
    if (search) filters.name = { $regex: search, $options: 'i' };

    const [sortField, sortOrder] = sort.split(':');
    const options = {
      skip: (parseInt(page) - 1) * parseInt(limit),
      limit: parseInt(limit),
      sort: { [sortField]: sortOrder === 'desc' ? -1 : 1 },
    };

    const communities = await req.db.collection('Communities').find(filters, options).toArray();
    const total = await req.db.collection('Communities').countDocuments(filters);

    res.json({ communities, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    console.error('Error fetching communities:', error);
    res.status(500).json({ error: 'Failed to fetch communities.' });
  } finally {
    await client.close();
  }
});


// Create a new community
router.post('/', auth, isAdmin, upload.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'topicPictures', maxCount: 10 }
]), async (req, res) => {
  try {
    const { name, description, topics, privacy, rules, roles, questions } = req.body;

    // Validation
    if (!name || !description || !topics || !privacy || !rules || !roles || !questions) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
    let profilePictureUrl = null;

    // Upload profile picture to Azure Blob Storage
    if (req.files.profilePicture) {
      const profilePictureFile = req.files.profilePicture[0];
      const blobName = `${uuidv4()}-${profilePictureFile.originalname}`;
      const containerClient = blobServiceClient.getContainerClient('community-profile-pics');
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      await blockBlobClient.uploadFile(profilePictureFile.path);
      profilePictureUrl = blockBlobClient.url;
    } else{
      console.log('No profile picture uploaded');
    }

    // Process topic pictures
    const topicPictureUrls = {};
    if (req.files.topicPictures) {
      const containerClient = blobServiceClient.getContainerClient('topic-profile-pics');
      for (const file of req.files.topicPictures) {
        const topicName = file.fieldname.split('_')[1];
        const blobName = `${uuidv4()}-${file.originalname}`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        await blockBlobClient.uploadFile(file.path);
        topicPictureUrls[topicName] = blockBlobClient.url;
      }
    }

    const communityId = uuidv4();
    const newCommunity = {
      communityId,
      name,
      description,
      topics: topics.split(','),
      privacy,
      rules,
      roles: JSON.parse(roles),
      questions: JSON.parse(questions),
      profilePicture: profilePictureUrl,
      topicPictures: topicPictureUrls,
      createdAt: new Date(),
    };

    await client.connect();
    const db = req.body;
    await req.db.collection('Communities').insertOne(newCommunity);

    res.status(201).json({ message: 'Community created successfully', community: newCommunity });
  } catch (error) {
    console.error('Error creating community:', error);
    res.status(500).json({ error: 'Failed to create community.' });
  } finally {
    await client.close();
  }
});

// Update a community
router.put('/:communityId', auth, isAdmin, upload.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'topicPictures', maxCount: 10 }
]), async (req, res) => {
  try {
    const { communityId } = req.params;
    const updates = req.body;

    // Validate required fields
    if (!updates.name || !updates.description || !updates.privacy) {
      return res.status(400).json({ error: 'Name, description, and privacy are required.' });
    }

    // Azure Blob Service Client
    const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);

    // Handle profile picture update (optional)
    if (req.files.profilePicture) {
      const profilePictureFile = req.files.profilePicture[0];

      // Validate file type
      if (!profilePictureFile.mimetype.startsWith('image/')) {
        return res.status(400).json({ error: 'Profile picture must be an image.' });
      }

      const blobName = `${uuidv4()}-${profilePictureFile.originalname}`;
      const containerClient = blobServiceClient.getContainerClient('community-profile-pics');
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      try {
        await blockBlobClient.uploadFile(profilePictureFile.path);
        updates.profilePicture = blockBlobClient.url;  // Set the URL of the uploaded file
      } catch (error) {
        console.error('Error uploading profile picture:', error);
        return res.status(500).json({ error: 'Failed to upload profile picture.' });
      }
    }

    // Handle topic picture updates (optional)
    if (req.files.topicPictures) {
      const containerClient = blobServiceClient.getContainerClient('topic-profile-pics');
      updates.topicPictures = updates.topicPictures || {};  // Initialize if not already

      for (const file of req.files.topicPictures) {
        // Validate file type
        if (!file.mimetype.startsWith('image/')) {
          return res.status(400).json({ error: 'Topic picture must be an image.' });
        }

        const topicName = file.fieldname.split('_')[1];
        const blobName = `${uuidv4()}-${file.originalname}`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        try {
          await blockBlobClient.uploadFile(file.path);
          updates.topicPictures[topicName] = blockBlobClient.url;  // Store the URL of the uploaded topic picture
        } catch (error) {
          console.error('Error uploading topic picture:', error);
          return res.status(500).json({ error: 'Failed to upload topic picture.' });
        }
      }
    }

    // Connect to database and update the community
    await client.connect();
    const db = req.body;
    const result = await req.db.collection('Communities').updateOne(
      { communityId },
      { $set: updates }
    );

    // Check if the community was found and updated
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Community not found.' });
    }

    res.json({ message: 'Community updated successfully' });
  } catch (error) {
    console.error('Error updating community:', error);
    res.status(500).json({ error: 'Failed to update community.' });
  } finally {
    await client.close();
  }
});


// Approve join request
router.post('/:communityId/requests/:requestId/approve', auth, isAdmin, async (req, res) => {
  try {
    const { communityId, requestId } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }

    await client.connect();
    const db = req.body;

    const result = await req.db.collection('JoinRequests').updateOne(
      { communityId, requestId },
      { $set: { status: 'approved', role } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Join request not found' });
    }

    res.json({ message: 'Join request approved successfully' });
  } catch (error) {
    console.error('Error approving join request:', error);
    res.status(500).json({ error: 'Failed to approve join request.' });
  } finally {
    await client.close();
  }
});

// Reject join request
router.post('/:communityId/requests/:requestId/reject', auth, isAdmin, async (req, res) => {
  try {
    const { communityId, requestId } = req.params;

    await client.connect();
    const db = req.body;

    const result = await req.db.collection('JoinRequests').updateOne(
      { communityId, requestId },
      { $set: { status: 'rejected' } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Join request not found' });
    }

    res.json({ message: 'Join request rejected successfully' });
  } catch (error) {
    console.error('Error rejecting join request:', error);
    res.status(500).json({ error: 'Failed to reject join request.' });
  } finally {
    await client.close();
  }
});



// Delete community
router.delete('/:communityId', auth, isAdmin, async (req, res) => {
  try {
    const { communityId } = req.params;
    await client.connect();
    const db = req.body;

    // Deleting the community
    const result = await req.db.collection('Communities').deleteOne({ communityId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Community not found' });
    }

    res.json({ message: 'Community deleted successfully' });
  } catch (error) {
    console.error('Error deleting community:', error);
    res.status(500).json({ error: 'Failed to delete community.' });
  } finally {
    await client.close();
  }
});

// Archive community (soft delete)
router.put('/:communityId/archive', auth, isAdmin, async (req, res) => {
  try {
    const { communityId } = req.params;
    await client.connect();
    const db = req.body;

    // Archiving the community (marking as inactive)
    const result = await req.db.collection('Communities').updateOne(
      { communityId },
      { $set: { archived: true } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Community not found' });
    }

    res.json({ message: 'Community archived successfully' });
  } catch (error) {
    console.error('Error archiving community:', error);
    res.status(500).json({ error: 'Failed to archive community.' });
  } finally {
    await client.close();
  }
});



// Fetch community analytics
router.get('/analytics', auth, isAdmin, async (req, res) => {
  try {
    await client.connect();
    const db = req.body;
    
    const analytics = await req.db.collection('Communities').aggregate([
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
          members: { $size: '$members' },
          postCount: { $size: '$posts' },
        },
      },
    ]).toArray();

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching community analytics:', error);
    res.status(500).json({ error: 'Failed to fetch community analytics.' });
  } finally {
    await client.close();
  }
});


module.exports = router;
