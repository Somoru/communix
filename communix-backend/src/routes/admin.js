const express = require('express');
const jwt = require('jsonwebtoken');
const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const multer = require('multer'); // For handling file uploads
const { BlobServiceClient } = require('@azure/storage-blob'); 


const auth = (req, res, next) => {
    try {
      const token = req.header('Authorization').replace('Bearer ', ''); // Or just req.header('Authorization') if not using Bearer
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      console.error("Authentication error:", err);
      res.status(401).send({ error: 'Please authenticate.' });
    }
  };

  

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401).send({ error: 'Forbidden. Admin access required.' });
  }
};

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin';

    if (username !== adminUsername || password !== adminPassword) {
      return res.status(401).send({ error: 'Invalid username or password' });
    }

    const token = jwt.sign({ userId: adminUsername, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });

  } catch (error) {
    console.error('Error during admin login:', error);
    res.status(500).send({ error: 'Failed to login' });
  }
});

router.get('/users', auth, isAdmin, async (req, res) => {
  try {
    await client.connect();
    const db = client.db(process.env.DATABASE_NAME);
    const usersCollection = db.collection('Users');
    const users = await usersCollection.find({}).toArray(); // Fetch all users
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  } finally {
    await client.close();
  }
});

// Configure multer for file uploads (you might need to adjust this based on your needs)
const upload = multer({ dest: 'uploads/' }); // Store uploaded files temporarily in the 'uploads' directory


router.post('/admin/communities', auth, isAdmin, upload.fields([
  { name: 'profilePicture', maxCount: 1 }, // For community profile picture
  { name: 'topicPictures', maxCount: 10 } // For topic profile pictures (adjust maxCount as needed)
]), async (req, res) => {
  try {
    const {
      name,
      description,
      topics,
      privacy,
      rules,
      roles,
      questions,
      topicAccess,
    } = req.body;

    
    if (!name || !description || !topics || !privacy || !rules || !roles || !questions) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 1. Upload the profile picture to Azure Blob Storage (if provided)
    let profilePictureUrl = null;
    if (req.files && req.files['profilePicture']) {
      const blobServiceClient = new BlobServiceClient(process.env.AZURE_STORAGE_CONNECTION_STRING);
      const containerName = 'community-profile-pics';
      const containerClient = blobServiceClient.getContainerClient(containerName);
      const blobName = `${uuidv4()}-${req.files['profilePicture'][0].originalname}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.uploadFile(req.files['profilePicture'][0].path);
      profilePictureUrl = blockBlobClient.url;
    }

    // 2. Upload topic profile pictures to Azure Blob Storage (if provided)
    const topicPictureUrls = {};
    if (req.files && req.files['topicPictures']) {
      const blobServiceClient = new BlobServiceClient(process.env.AZURE_STORAGE_CONNECTION_STRING);
      const containerName = 'topic-profile-pics';
      const containerClient = blobServiceClient.getContainerClient(containerName);

      for (const file of req.files['topicPictures']) {
        const topic = file.fieldname.split('_')[1]; // Assuming the field name is like 'topicPicture_topicName'
        const blobName = `${uuidv4()}-${file.originalname}`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        await blockBlobClient.uploadFile(file.path);
        topicPictureUrls[topic] = blockBlobClient.url;
      }
    }

    // 3. Generate a unique communityId
    const communityId = uuidv4();

    // 4. Process topic access data
    const processedQuestions = {};
    for (const role in questions) {
      const roleQuestions = questions[role];
      const topicAccessForRole = topicAccess[role] || []; // Get topic access for this role, default to empty array if not provided

      processedQuestions[role] = [
        { 
          text: 'Topic Access', // Or any other identifier for this question
          type: 'topicAccess', // You might want to use a different type for this question
          options: topicAccessForRole 
        },
        ...roleQuestions, // Add the other questions for this role
      ];
    }

    // 5. Create the community object
    const newCommunity = {
      communityId,
      name,
      description,
      topics,
      privacy,
      rules,
      roles,
      questions: processedQuestions, // Use the processed questions object
      profilePicture: profilePictureUrl,
      topicPictures: topicPictureUrls,
      createdAt: new Date(),
    };

    // 6. Connect to MongoDB
    await client.connect();
    const db = client.db(process.env.DATABASE_NAME);
    const communitiesCollection = db.collection('Communities');

    // 7. Insert the community into the database
    await communitiesCollection.insertOne(newCommunity);

    const topicsArray = newCommunity.topics.split(',');
    for (let i = 0; i < topicsArray.length; i++) {
      const topic = topicsArray[i].trim();
      const newGroupChat = {
        chatId: uuidv4(),
        name: topic,
        communityId: newCommunity.communityId,
        topicIndex: i, // Store the index of the topic in the topics array
        members: [], // Initially no members in the group chat
        createdAt: new Date(),
      };

      // Insert the group chat into the Groups collection
      const groupsCollection = db.collection('Groups');
      await groupsCollection.insertOne(newGroupChat);
    }

    // 8. Send a success response
    res.status(201).json({ message: 'Community created successfully', community: newCommunity });

  } catch (error) {
    console.error('Error creating community:', error);
    res.status(500).json({ error: 'Failed to create community' });
  }
});

router.get('/communities', auth, isAdmin, async (req, res) => {
  try {
    await client.connect();
    const db = client.db(process.env.DATABASE_NAME);
    const communitiesCollection = db.collection('Communities');

    const communities = await communitiesCollection.find({}).toArray(); // Fetch all communities

    res.json(communities);
  } catch (error) {
    console.error('Error fetching communities:', error);
    res.status(500).json({ error: 'Failed to fetch communities' });
  } finally {
    
  }
});

router.get('/communities/:communityId', auth, isAdmin, async (req, res) => {
  try {
    const { communityId } = req.params;

    await client.connect();
    const db = client.db(process.env.DATABASE_NAME);
    const communitiesCollection = db.collection('Communities');

    const community = await communitiesCollection.findOne({ communityId });

    if (community) {
      res.json(community);
    } else {
      res.status(404).json({ error: 'Community not found' });
    }
  } catch (error) {
    console.error('Error fetching community details:', error);
    res.status(500).json({ error: 'Failed to fetch community details' });
  } finally {
    
  }
});

router.put('/admin/communities/:communityId', auth, isAdmin, upload.any(), async (req, res) => {
  try {
    const { communityId } = req.params;
    const updatedData = req.body;

    // ... (validation) ...

    // 1. Upload the new profile picture to Azure Blob Storage (if provided)
    let profilePictureUrl = updatedData.profilePicture;
    if (req.files && req.files['profilePicture']) {
      const blobServiceClient = new BlobServiceClient(process.env.AZURE_STORAGE_CONNECTION_STRING);
      const containerName = 'community-profile-pics';
      const containerClient = blobServiceClient.getContainerClient(containerName);
      const blobName = `${uuidv4()}-${req.file.originalname}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.uploadFile(req.file.path);
      profilePictureUrl = blockBlobClient.url;

      // ... (Optional: Delete the old profile picture from Azure Storage if it exists) ...
    }

    // 2. Upload new topic profile pictures to Azure Blob Storage (if provided)
    const topicPictureUrls = { ...updatedData.topicPictures };
    if (req.files) {
      const blobServiceClient = new BlobServiceClient(process.env.AZURE_STORAGE_CONNECTION_STRING);
      const containerName = 'topic-profile-pics';
      const containerClient = blobServiceClient.getContainerClient(containerName);

      for (const file of req.files) {
        if (file.fieldname.startsWith('topicPicture_')) {
          const topic = file.fieldname.split('_')[1];
          const blobName = `${uuidv4()}-${file.originalname}`;
          const blockBlobClient = containerClient.getBlockBlobClient(blobName);
          await blockBlobClient.uploadFile(file.path);
          topicPictureUrls[topic] = blockBlobClient.url;

          // ... (Optional: Delete the old topic picture from Azure Storage) ...
        }
      }
    }

    const processedQuestions = {};
    for (const role in updatedData.questions) {
      const roleQuestions = updatedData.questions[role];
      const topicAccessForRole = updatedData.topicAccess[role] || [];

      processedQuestions[role] = [
        {
          text: 'Topic Access',
          type: 'topicAccess',
          options: topicAccessForRole
        },
        ...roleQuestions,
      ];
    }


    // 3. Update the community object
    const updatedCommunity = {
      ...updatedData,
      questions: processedQuestions, // Update the questions with topic access
      profilePicture: profilePictureUrl, // Update the profile picture URL
      topicPictures: topicPictureUrls, // Update the topic picture URLs
    };

    // 3. Connect to MongoDB
    await client.connect();
    const db = client.db(process.env.DATABASE_NAME);
    const communitiesCollection = db.collection('Communities');

    // 4. Update the community in the database
    const result = await communitiesCollection.updateOne(
      { communityId },
      { $set: updatedCommunity }
    );

    // 5. Send a success response
    if (result.modifiedCount === 1) {
      res.json({ message: 'Community updated successfully' });
    } else {
      res.status(404).json({ error: 'Community not found or not updated' });
    }

  } catch (error) {
    console.error('Error updating community:', error);
    res.status(500).json({ error: 'Failed to update community' });
  }
});

router.delete('/communities/:communityId', auth, isAdmin, async (req, res) => {
  try {
    const { communityId } = req.params;

    await client.connect();
    const db = client.db(process.env.DATABASE_NAME);
    const communitiesCollection = db.collection('Communities');

    // ... (check if community exists) ...

    const result = await communitiesCollection.deleteOne({ communityId });

    if (result.deletedCount === 1) {
      res.json({ message: 'Community deleted successfully' });
    } else {
      res.status(404).json({ error: 'Community not found' });
    }

  } catch (error) {
    console.error('Error deleting community:', error);
    res.status(500).json({ error: 'Failed to delete community' });
  } finally {
    
  }
});

router.get('/communities/:communityId/join-requests', auth, isAdmin, async (req, res) => {
  try {
    const { communityId } = req.params;

    await client.connect();
    const db = client.db(process.env.DATABASE_NAME);
    const joinRequestsCollection = db.collection('CommunityJoinRequests'); // Assuming this is your collection name

    const joinRequests = await joinRequestsCollection.find({ communityId, status: 'pending' }).toArray(); // Fetch pending requests

    res.json(joinRequests);
  } catch (error) {
    console.error('Error fetching join requests:', error);
    res.status(500).json({ error: 'Failed to fetch join requests' });
  } finally {
    
  }
});

router.post('/communities/:communityId/join-requests/:requestId/approve', auth, isAdmin, async (req, res) => {
  try {
    const { communityId, requestId } = req.params;
    const { role } = req.body; // Get the role from the request body

    // ... (validation if needed) ...

    await client.connect();
    const db = client.db(process.env.DATABASE_NAME);
    const joinRequestsCollection = db.collection('CommunityJoinRequests');

    const result = await joinRequestsCollection.updateOne(
      { communityId, requestId },
      { $set: { status: 'approved', role } }
    );

    if (result.modifiedCount === 1) {
      res.json({ message: 'Join request approved' });
    } else {
      res.status(404).json({ error: 'Join request not found' });
    }
  } catch (error) {
    console.error('Error approving join request:', error);
    res.status(500).json({ error: 'Failed to approve join request' });
  } finally {
    
  }
});

router.post('/communities/:communityId/join-requests/:requestId/reject', auth, isAdmin, async (req, res) => {
  try {
    const { communityId, requestId } = req.params;

    await client.connect();
    const db = client.db(process.env.DATABASE_NAME);
    const joinRequestsCollection = db.collection('CommunityJoinRequests');

    const result = await joinRequestsCollection.updateOne(
      { communityId, requestId },
      { $set: { status: 'rejected' } }
    );

    if (result.modifiedCount === 1) {
      res.json({ message: 'Join request rejected' });
    } else {
      res.status(404).json({ error: 'Join request not found' });
    }
  } catch (error) {
    console.error('Error rejecting join request:', error);
    res.status(500).json({ error: 'Failed to reject join request' });
  } finally {
    
  }
});

router.put('/users/:userId', auth, isAdmin, async (req, res) => {
  try {
    console.log('PUT request body:', req.body);
    const { userId } = req.params;
    const updatedData = req.body;
    console.log('Received data:', updatedData);

    // ... (validation if needed) ...

    await client.connect();
    const db = client.db(process.env.DATABASE_NAME);
    const usersCollection = db.collection('Users');

    // ... (check if user exists) ...

    const result = await usersCollection.updateOne(
      { userId },
      { $set: updatedData } // Make sure to update with the correct data
    );

    if (result.modifiedCount === 1) {
      res.json({ message: 'User updated successfully' });
    } else {
      res.status(404).json({ error: 'User not found or not updated' });
    }
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  } finally {
    
  }
});

router.delete('/users/:userId', auth, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    await client.connect();
    const db = client.db(process.env.DATABASE_NAME);
    const usersCollection = db.collection('Users');

    const result = await usersCollection.deleteOne({ userId });

    if (result.deletedCount === 1) {
      res.json({ message: 'User deleted successfully' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  } finally {
    
  }
});

router.post('/admin/communities/:communityId/members', auth, isAdmin, async (req, res) => {
  try {
    const { communityId } = req.params;
    const { userIds } = req.body; // Assuming you send an array of userIds

    // ... (validation to check if communityId and userIds are valid) ...

    await client.connect();
    const db = client.db(process.env.DATABASE_NAME);
    const communitiesCollection = db.collection('Communities');

    const result = await communitiesCollection.updateOne(
      { communityId },
      { $addToSet: { members: { $each: userIds } } } // Add userIds to the members array (avoid duplicates)
    );

    if (result.modifiedCount === 1) {
      res.json({ message: 'Members added successfully' });
    } else {
      res.status(404).json({ error: 'Community not found' });
    }

  } catch (error) {
    console.error('Error adding members to community:', error);
    res.status(500).json({ error: 'Failed to add members to community' });
  }
});


module.exports = router;