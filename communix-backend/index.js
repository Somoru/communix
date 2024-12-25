const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB Configuration
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function main() {
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');

    // Your other code here...
    const indexRouter = require('./src/routes/index');
    app.use('/', indexRouter);

    const authRouter = require('./src/routes/auth');
    app.use('/auth', authRouter);

    const usersRouter = require('./src/routes/users');
    app.use('/users', usersRouter);

    const communitiesRouter = require('./src/routes/communities');
    app.use('/communities', communitiesRouter);

    const groupsRouter = require('./src/routes/groups');
    app.use('/groups', groupsRouter);

    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on port: ${port}`);
    });

  } catch (err) {
    console.error(err);
  }
}

main()
  .catch(console.error)
  .finally(() => client.close());


module.exports = app;
