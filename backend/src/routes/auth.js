const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query, run } = require('../db');
const verifyToken = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'velora-secret-key-12345';

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user exists
    const existing = await query(`SELECT * FROM users WHERE email = ?`, [email]);
    if (existing.length > 0) return res.status(400).json({ error: 'User already exists' });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || 'defaultPassword123!', salt);

    // Create user
    const avatar = `https://api.dicebear.com/7.x/notionists/svg?seed=${name.replace(' ', '')}`;
    const result = await run(
      `INSERT INTO users (name, email, password, avatar) VALUES (?, ?, ?, ?)`,
      [name, email, hashedPassword, avatar]
    );

    // Create JWT
    const token = jwt.sign({ id: result.id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({
      token,
      user: { id: result.id, name, email, avatar }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const users = await query(`SELECT * FROM users WHERE email = ?`, [email]);
    if (users.length === 0) return res.status(400).json({ error: 'Invalid credentials' });

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar, cover: user.cover, bio: user.bio }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user data
router.get('/me', verifyToken, async (req, res) => {
  try {
    const users = await query(`SELECT id, name, email, avatar, cover, bio FROM users WHERE id = ?`, [req.userId]);
    if (users.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(users[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
