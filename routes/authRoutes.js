const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Hard-coded admin credentials (CHANGE THESE in production!)
const ADMIN_EMAIL = 'admin@myapp.com';
const ADMIN_PASSWORD = 'AdminSecure123!';
const ADMIN_NAME = 'System Admin';

// POST /api/auth/register
// → No duplicate check — same email can register multiple times
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: 'user'
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
});

// POST /api/auth/login
// → Fixed admin + normal users
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    // Special fixed admin login (bypasses DB)
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const token = jwt.sign({ id: 'admin-fixed-id' }, process.env.JWT_SECRET, {
        expiresIn: '7d'
      });

      return res.json({
        token,
        user: {
          id: 'admin-fixed',
          name: ADMIN_NAME,
          email: ADMIN_EMAIL,
          role: 'admin'
        }
      });
    }

    // Normal user login
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;