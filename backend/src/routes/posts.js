const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { query, run, reelsQuery } = require('../db');
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

// Get all posts including comments (with pagination)
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const postsResult = await query(`
      SELECT p.*, u.name as user_name, u.avatar as user_avatar
      FROM posts p 
      JOIN users u ON p.user_id = u.id 
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    // Fetch comments and reel data for all posts
    const postsWithComments = await Promise.all(postsResult.map(async (post) => {
      const comments = await query(`
        SELECT c.*, u.name as user_name, u.avatar as user_avatar 
        FROM comments c 
        JOIN users u ON c.user_id = u.id 
        WHERE c.post_id = ?
        ORDER BY c.created_at ASC
      `, [post.id]);
      
      const likesCount = await query(`SELECT COUNT(*) as count FROM post_likes WHERE post_id = ?`, [post.id]);
      const userLiked = req.userId ? await query(`SELECT COUNT(*) as count FROM post_likes WHERE post_id = ? AND user_id = ?`, [post.id, req.userId]) : [{ count: 0 }];

      // Fetch reel video if shared
      let reelVideoUrl = null;
      if (post.reel_id) {
        const reelData = await reelsQuery('SELECT video_url FROM reels WHERE id = ?', [post.reel_id]);
        if (reelData.length > 0) {
          const rawUrl = reelData[0].video_url;
          reelVideoUrl = rawUrl.startsWith('http') ? rawUrl : `http://localhost:5000/uploads/${path.basename(rawUrl)}`;
        }
      }

      return {
        id: post.id,
        user: { id: post.user_id, name: post.user_name, avatar: post.user_avatar },
        content: post.content,
        image: post.image ? `http://localhost:5000/uploads/${path.basename(post.image)}` : null,
        reel_id: post.reel_id,
        reel_video_url: reelVideoUrl,
        feeling: post.feeling,
        location: post.location,
        likes: likesCount[0].count,
        comments: comments.length,
        shares: 0,
        time: post.created_at,
        liked: userLiked[0].count > 0,
        commentsList: comments.map(c => ({
          id: c.id,
          user: { id: c.user_id, name: c.user_name, avatar: c.user_avatar },
          text: c.content,
          time: c.created_at
        }))
      };
    }));

    res.json(postsWithComments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create Post
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { content, feeling, location } = req.body;
    const imagePath = req.file ? req.file.path.replace(/\\\\/g, '/') : null;

    if (!content && !imagePath) {
      return res.status(400).json({ error: 'Post must contain text or an image' });
    }

    const result = await run(
      `INSERT INTO posts (user_id, content, image, feeling, location) VALUES (?, ?, ?, ?, ?)`,
      [req.userId, content, imagePath, feeling || null, location || null]
    );

    res.status(201).json({ success: true, postId: result.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Like Post (Toggle Logic)
router.post('/:id/like', verifyToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.userId;

    const existing = await query('SELECT * FROM post_likes WHERE user_id = ? AND post_id = ?', [userId, postId]);
    
    if (existing.length > 0) {
      // Unlike
      await run('DELETE FROM post_likes WHERE user_id = ? AND post_id = ?', [userId, postId]);
      await run('UPDATE posts SET likes = MAX(0, likes - 1) WHERE id = ?', [postId]);
      res.json({ success: true, liked: false });
    } else {
      // Like
      await run('INSERT INTO post_likes (user_id, post_id) VALUES (?, ?)', [userId, postId]);
      await run('UPDATE posts SET likes = likes + 1 WHERE id = ?', [postId]);
      
      // Create notification
      const post = await query('SELECT user_id FROM posts WHERE id = ?', [postId]);
      if (post.length > 0 && post[0].user_id !== userId) {
        await run('INSERT INTO notifications (user_id, actor_id, type, target_id) VALUES (?, ?, ?, ?)', [post[0].user_id, userId, 'like', postId]);
      }
      
      res.json({ success: true, liked: true });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Comment
router.delete('/comments/:id', verifyToken, async (req, res) => {
    try {
      const result = await run('DELETE FROM comments WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
      if (result.changes === 0) return res.status(403).json({ error: 'Unauthorized to delete this comment' });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

// Add Comment
router.post('/comment', verifyToken, async (req, res) => {
  try {
    const { post_id, content } = req.body;
    const result = await run(
      `INSERT INTO comments (user_id, post_id, content) VALUES (?, ?, ?)`,
      [req.userId, post_id, content]
    );

    // Create notification
    const post = await query('SELECT user_id FROM posts WHERE id = ?', [post_id]);
    if (post.length > 0 && post[0].user_id !== req.userId) {
      await run('INSERT INTO notifications (user_id, actor_id, type, target_id) VALUES (?, ?, ?, ?)', [post[0].user_id, req.userId, 'comment', post_id]);
    }

    res.status(201).json({ success: true, commentId: result.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
