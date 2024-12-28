// communities.js

const express = require('express');
const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');

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

// Get Community Details endpoint
router.get('/:communityId', async (req, res) => {
  try {
    const { communityId } = req.params;

    await client.connect();
    //const db = client.db(process.env.DATABASE_NAME);
const db = client.db('communix-db');
    const communitiesCollection = db.collection('Communities');

    const community = await communitiesCollection.findOne({ communityId });

    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    res.json(community);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve community' });
  } finally {
    await client.close();
  }
});

// Join Community Request endpoint
router.post('/:communityId/join', auth,
  [
    body('answers').isArray().notEmpty().withMessage('At least one answer is required').custom((answers) => {
      return answers.every(answer => answer.question && answer.answer);
    }).withMessage('Invalid answer format')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  try {
    const { communityId } = req.params;
    const { answers } = req.body;
    const userId = req.user.userId;

    // Validation for answers
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: 'Invalid answers provided' });
    }
    for (const answer of answers) {
      if (!answer.question || !answer.answer) {
        return res.status(400).json({ error: 'Invalid answer format' });
      }
    }

    const newJoinRequest = {
      requestId: uuidv4(),
      communityId,
      userId,
      answers,
      status: 'pending',
      role: null,
      createdAt: new Date()
    };

    await client.connect();
    //const db = client.db(process.env.DATABASE_NAME);
const db = client.db('communix-db');
    const communityJoinRequestsCollection = db.collection('CommunityJoinRequests');

    await communityJoinRequestsCollection.insertOne(newJoinRequest);

    res.status(201).json({ message: 'Join request submitted' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit join request' });
  } finally {
    await client.close();
  }
});

module.exports = router;