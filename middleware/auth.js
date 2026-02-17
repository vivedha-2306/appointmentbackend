const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Special case: fixed admin token (fake ID)
      if (decoded.id === 'admin-fixed-id') {
        // Manually set admin user object (no DB query needed)
        req.user = {
          _id: 'admin-fixed-id',
          name: 'System Admin',
          email: 'admin@myapp.com',
          role: 'admin'
        };
        console.log('Fixed admin authenticated successfully');
        return next();
      }

      // Normal user: lookup in database
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      console.log(`Authenticated user: ${req.user.email} (role: ${req.user.role})`);
      next();
    } catch (err) {
      console.error('Auth middleware error:', err.message);
      return res.status(401).json({ message: 'Not authorized - invalid token' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized - no token' });
  }
};

module.exports = { protect };