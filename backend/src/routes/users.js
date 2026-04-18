const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { query, run } = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '../../uploads');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, 'profile-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Search Users
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const users = await query(
      'SELECT id, name, avatar, bio FROM users WHERE name LIKE ? LIMIT 10',
      [`%${q}%`]
    );
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a user profile by ID
router.get('/:id', async (req, res) => {
  try {
    const users = await query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (users.length === 0) return res.status(404).json({ error: 'User not found' });
    
    // Remove password
    const { password, ...userData } = users[0];

    // Get their posts
    const posts = await query(`
      SELECT p.*, u.name as user_name, u.avatar as user_avatar 
      FROM posts p 
      JOIN users u ON p.user_id = u.id 
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC
    `, [req.params.id]);

    const structuredPosts = posts.map(post => ({
        id: post.id,
        user: { id: post.user_id, name: post.user_name, avatar: post.user_avatar },
        content: post.content,
        image: post.image ? `http://localhost:5000/uploads/${path.basename(post.image)}` : null,
        likes: post.likes,
        comments: 0,
        time: post.created_at
    }));

    res.json({
      user: userData,
      posts: structuredPosts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Profile
router.put('/', verifyToken, upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), async (req, res) => {
  try {
    const { 
      bio, name, workplace, college, high_school, 
      current_city, hometown, relationship, 
      phone, website, gender, birth_date 
    } = req.body;

    let sql = 'UPDATE users SET ';
    const params = [];

    const fields = { 
      name, bio, workplace, college, high_school, 
      current_city, hometown, relationship, 
      phone, website, gender, birth_date 
    };

    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        sql += `${key} = ?, `;
        params.push(value);
      }
    }

    if (req.files['avatar']) { 
      sql += 'avatar = ?, '; 
      params.push(`http://localhost:5000/uploads/${path.basename(req.files['avatar'][0].path)}`); 
    }
    if (req.files['cover']) { 
      sql += 'cover = ?, '; 
      params.push(`http://localhost:5000/uploads/${path.basename(req.files['cover'][0].path)}`); 
    }

    // Check if anything was updated
    if (params.length === 0) return res.json({ success: true, message: 'No changes detected' });

    // Remove trailing comma and space
    sql = sql.slice(0, -2);
    sql += ' WHERE id = ?';
    params.push(req.userId);

    await run(sql, params);
    
    // Fetch updated
    const users = await query('SELECT * FROM users WHERE id = ?', [req.userId]);
    const { password, ...updatedUser } = users[0];
    res.json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
