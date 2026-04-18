const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { query, run } = require('../db');
const verifyToken = require('../middleware/auth');

const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, 'story-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Get active stories from friends and self
router.get('/', verifyToken, async (req, res) => {
  try {
    // Standard 24-hour expiration check
    const stories = await query(`
      SELECT s.*, u.name as user_name, u.avatar as user_avatar
      FROM stories s
      JOIN users u ON s.user_id = u.id
      WHERE s.expires_at > CURRENT_TIMESTAMP
      ORDER BY s.created_at DESC
    `);
    
    // Group by user
    const groupedStories = stories.reduce((acc, current) => {
      if (!acc[current.user_id]) {
        acc[current.user_id] = {
          user_id: current.user_id,
          user_name: current.user_name,
          user_avatar: current.user_avatar,
          stories: []
        };
      }
      acc[current.user_id].stories.push({
        id: current.id,
        media_url: current.media_url,
        type: current.type,
        created_at: current.created_at
      });
      return acc;
    }, {});

    res.json(Object.values(groupedStories));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create Story
router.post('/', verifyToken, upload.single('media'), async (req, res) => {
  try {
    const mediaPath = req.file ? req.file.path.replace(/\\/g, '/') : null;
    const { type } = req.body; // 'image' or 'video'

    if (!mediaPath) {
      return res.status(400).json({ error: 'Story requires media (image or video)' });
    }

    // Set expiration to 24 hours from now
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').split('.')[0];

    const result = await run(
      `INSERT INTO stories (user_id, media_url, type, expires_at) VALUES (?, ?, ?, ?)`,
      [req.userId, mediaPath, type || 'image', expiresAt]
    );

    res.status(201).json({ success: true, storyId: result.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
