const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const path = require('path');

// Import MongoDB middleware
const { dbMiddleware } = require('./src/middlewares/db');

const app = express();
const port = process.env.PORT || 5000;

// Middleware Setup
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(dbMiddleware); // Use MongoDB middleware

// Import and Use Routes
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

// Admin Routes
const adminRoutes = require('./src/routes/adminRoutes');
app.use('/admin', adminRoutes);

// Default Route for Frontend (Optional)
// app.use(express.static(path.join(__dirname, 'build')));
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'build', 'index.html'));
// });

// Start the Server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

module.exports = app;
