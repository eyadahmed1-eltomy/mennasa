const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { query, run } = require('../db');
const verifyToken = require('../middleware/auth');

// Setup file upload natively pointing to "database" level folder "uploads" mapped out on the PC
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, 'post-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Get all posts including comments
router.get('/', async (req, res) => {
  try {
    const postsResult = await query(`
      SELECT p.*, u.name as user_name, u.avatar as user_avatar 
      FROM posts p 
      JOIN users u ON p.user_id = u.id 
      ORDER BY p.created_at DESC
    `);

    // Fetch comments for all posts
    const postsWithComments = await Promise.all(postsResult.map(async (post) => {
      const comments = await query(`
        SELECT c.*, u.name as user_name, u.avatar as user_avatar 
        FROM comments c 
        JOIN users u ON c.user_id = u.id 
        WHERE c.post_id = ?
        ORDER BY c.created_at ASC
      `, [post.id]);
      
      const structuredPost = {
        id: post.id,
        user: { id: post.user_id, name: post.user_name, avatar: post.user_avatar },
        content: post.content,
        image: post.image ? `http://localhost:5000/uploads/${path.basename(post.image)}` : null,
        likes: post.likes,
        comments: comments.length,
        shares: 0,
        time: post.created_at,
        liked: false,
        commentsList: comments.map(c => ({
          id: c.id,
          user: { id: c.user_id, name: c.user_name, avatar: c.user_avatar },
          text: c.content,
          time: c.created_at
        }))
      };
      return structuredPost;
    }));

    res.json(postsWithComments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create Post
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { content } = req.body;
    const imagePath = req.file ? req.file.path.replace(/\\\\/g, '/') : null;

    if (!content && !imagePath) {
      return res.status(400).json({ error: 'Post must contain text or an image' });
    }

    const result = await run(
      `INSERT INTO posts (user_id, content, image) VALUES (?, ?, ?)`,
      [req.userId, content, imagePath]
    );

    res.status(201).json({ success: true, postId: result.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Like Post
router.post('/:id/like', verifyToken, async (req, res) => {
  try {
    await run(`UPDATE posts SET likes = likes + 1 WHERE id = ?`, [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
