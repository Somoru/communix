const jwt = require('jsonwebtoken');

// Authentication middleware
const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    console.log('Authorization Header:', req.headers.authorization);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

// Admin validation middleware
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden. Admin access required.' });
  }
};

module.exports = { auth, isAdmin };
