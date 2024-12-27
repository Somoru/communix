const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { MongoClient } = require('mongodb');
const { body, validationResult } = require('express-validator');
const { sendWelcomeEmail } = require('../services/email'); 

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

// Helper function to generate a random 4-digit ID
function generate4DigitId() {
  return Math.floor(1000 + Math.random() * 9000);
}

// Function to generate a unique userId
async function generateUniqueUserId(name, usersCollection) {
  let userId;
  let isUnique = false;

  while (!isUnique) {
    userId = `${name.replace(/\s/g, '').toLowerCase()}.${generate4DigitId()}`;
    const existingUser = await usersCollection.findOne({ userId });
    if (!existingUser) {
      isUnique = true;
    }
  }

  return userId;
}

// Signup endpoint
router.post('/signup', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').isStrongPassword().withMessage('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one symbol'),
  body('profession').notEmpty().withMessage('Profession is required'),
  body('onboardingAnswers').isArray().withMessage('Onboarding answers must be an array')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, password, profession, onboardingAnswers } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Connect to MongoDB (only connect once)
    await client.connect();
    //const db = client.db(process.env.DATABASE_NAME);
    const db = client.db('communix-db');
    const usersCollection = db.collection('Users');

    // Check for duplicate email
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Generate unique userId
    const userId = await generateUniqueUserId(name, usersCollection);

    // Create new user
    const newUser = {
      userId,
      name,
      email,
      password: hashedPassword,
      profession,
      onboardingAnswers,
      createdAt: new Date()
    };

    const result = await usersCollection.insertOne(newUser);
    const createdUser = await usersCollection.findOne({ _id: result.insertedId });
    
    sendWelcomeEmail(newUser.email, newUser.name); 
    // Generate JWT token
    const token = jwt.sign({ id: createdUser._id, userId: createdUser.userId, email: createdUser.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ user: createdUser, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create user' });
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
});

// Login endpoint
router.post('/login', [
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    // Connect to MongoDB (only connect once)
    await client.connect();
    //const db = client.db(process.env.DATABASE_NAME);
const db = client.db('communix-db');
    const usersCollection = db.collection('Users');

    // Find user by email
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, userId: user.userId, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to login' });
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
});

// Onboarding endpoint
router.put('/users/:userId/onboarding', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { onboardingAnswers } = req.body;

    // Connect to MongoDB
    await client.connect();
    ////const db = client.db(process.env.DATABASE_NAME);
    const db = client.db('communix-db');
    const usersCollection = db.collection('Users');

    // Find the user
    const user = await usersCollection.findOne({ userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update the user's onboardingAnswers
    await usersCollection.updateOne(
      { userId }, 
      { $set: { onboardingAnswers } } 
    );

    

    res.json({ message: 'Onboarding answers saved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save onboarding answers' });
  } finally {
    //await client.close();
  }
});


module.exports = router;