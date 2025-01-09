const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const dbMiddleware = async (req, res, next) => {
  try {
    // Check if the client is already connected
    if (!client.topology || !client.topology.isConnected()) {
      await client.connect(); // Connect the MongoDB client
      console.log('MongoDB connected');
    }
    req.dbClient = client; // Attach the MongoClient to the request
    req.db = client.db('communix-db'); // Attach the database instance
    next();
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
};

module.exports = {
  dbMiddleware,
  client, // Export the client for testing or external usage if needed
};
