const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query, run } = require('../db');
const verifyToken = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'velora-secret-key-12345';

// Global error handler wrapper
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Register
router.post('/register', asyncHandler(async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Field Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide name, email, and password' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existing = await query(`SELECT * FROM users WHERE email = ?`, [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const avatar = `https://api.dicebear.com/7.x/notionists/svg?seed=${name.replace(/\s+/g, '')}`;
    const result = await run(
      `INSERT INTO users (name, email, password, avatar) VALUES (?, ?, ?, ?)`,
      [name, email, hashedPassword, avatar]
    );

    // Create JWT
    const token = jwt.sign({ id: result.id }, JWT_SECRET, { expiresIn: '7d' });
    
    return res.status(201).json({
      token,
      user: { id: result.id, name, email, avatar }
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
}));

// Login
router.post('/login', asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const users = await query(`SELECT * FROM users WHERE email = ?`, [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    return res.status(200).json({
      token,
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        avatar: user.avatar, 
        cover: user.cover, 
        bio: user.bio 
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
}));

// Get current user data
router.get('/me', verifyToken, asyncHandler(async (req, res) => {
  try {
    const users = await query(`SELECT id, name, email, avatar, cover, bio FROM users WHERE id = ?`, [req.userId]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(200).json(users[0]);
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ error: 'Failed to fetch user data' });
  }
}));

// Google Auth - receives Firebase user info and creates/finds local user
router.post('/google', asyncHandler(async (req, res) => {
  try {
    const { email, name, photoURL, uid } = req.body;

    if (!email || !uid) {
      return res.status(400).json({ error: 'Missing required Google auth data' });
    }

    // Check if user already exists
    const existing = await query(`SELECT * FROM users WHERE email = ?`, [email]);

    let user;
    if (existing.length > 0) {
      user = existing[0];
    } else {
      // Create new user from Google data
      const avatar = photoURL || `https://api.dicebear.com/7.x/notionists/svg?seed=${(name || 'user').replace(/\s+/g, '')}`;
      const displayName = name || email.split('@')[0];
      
      // Generate a random password hash for Google users (they won't use password login)
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(`google_${uid}_${Date.now()}`, salt);

      const result = await run(
        `INSERT INTO users (name, email, password, avatar) VALUES (?, ?, ?, ?)`,
        [displayName, email, hashedPassword, avatar]
      );

      user = { id: result.id, name: displayName, email, avatar };
    }

    // Create JWT
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        cover: user.cover || null,
        bio: user.bio || null
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    return res.status(500).json({ error: 'Google authentication failed. Please try again.' });
  }
}));

module.exports = router;
