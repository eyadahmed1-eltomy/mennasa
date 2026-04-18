const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { query, run, reelsQuery, reelsRun } = require('../db');
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
    cb(null, 'reel-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Get all reels (excluding hidden ones for the user)
router.get('/', verifyToken, async (req, res) => {
  try {
    const reelsResult = await reelsQuery(`
      SELECT r.*,
      (SELECT COUNT(*) FROM reel_likes WHERE reel_id = r.id) as likes_count,
      (SELECT COUNT(*) FROM reel_comments WHERE reel_id = r.id) as comments_count,
      (SELECT COUNT(*) FROM reel_likes WHERE reel_id = r.id AND user_id = ?) as is_liked
      FROM reels r
      WHERE r.id NOT IN (SELECT reel_id FROM reel_hides WHERE user_id = ?)
      ORDER BY r.created_at DESC
    `, [req.userId, req.userId]);

    // Fetch user info for each reel from the main DB
    const formattedReels = await Promise.all(reelsResult.map(async (r) => {
      const userResult = await query('SELECT name, avatar FROM users WHERE id = ?', [r.user_id]);
      const user = userResult[0] || { name: 'Unknown', avatar: null };
      
      const followResult = await query('SELECT COUNT(*) as count FROM follows WHERE follower_id = ? AND following_id = ?', [req.userId, r.user_id]);

      return {
        ...r,
        video_url: r.video_url.startsWith('http') ? r.video_url : `http://localhost:5000/uploads/${path.basename(r.video_url)}`,
        user: { id: r.user_id, name: user.name, avatar: user.avatar },
        liked: r.is_liked > 0,
        following: followResult[0].count > 0
      };
    }));

    res.json(formattedReels);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create Reel
router.post('/', verifyToken, upload.single('video'), async (req, res) => {
  try {
    const { caption } = req.body;
    const videoPath = req.file ? req.file.path.replace(/\\/g, '/') : null;

    if (!videoPath) {
      return res.status(400).json({ error: 'Reel must contain a video' });
    }

    const result = await reelsRun(
      `INSERT INTO reels (user_id, caption, video_url) VALUES (?, ?, ?)`,
      [req.userId, caption, videoPath]
    );

    res.status(201).json({ success: true, reelId: result.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Like Reel
router.post('/:id/like', verifyToken, async (req, res) => {
  try {
    const reelId = req.params.id;
    const existing = await reelsQuery('SELECT * FROM reel_likes WHERE user_id = ? AND reel_id = ?', [req.userId, reelId]);
    
    if (existing.length > 0) {
      await reelsRun('DELETE FROM reel_likes WHERE user_id = ? AND reel_id = ?', [req.userId, reelId]);
      res.json({ success: true, liked: false });
    } else {
      await reelsRun('INSERT INTO reel_likes (user_id, reel_id) VALUES (?, ?)', [req.userId, reelId]);
      
      // Create notification in main db (velora.db)
      const reel = await reelsQuery('SELECT user_id FROM reels WHERE id = ?', [reelId]);
      if (reel.length > 0 && reel[0].user_id !== req.userId) {
        const { run } = require('../db'); // Ensure run helper is available
        await run('INSERT INTO notifications (user_id, actor_id, type, target_id) VALUES (?, ?, ?, ?)', [reel[0].user_id, req.userId, 'reel_like', reelId]);
      }
      
      res.json({ success: true, liked: true });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Comments for a Reel (Nested)
router.get('/:id/comments', verifyToken, async (req, res) => {
  try {
    const comments = await reelsQuery(`
      SELECT c.*,
      (SELECT COUNT(*) FROM reel_comment_likes WHERE comment_id = c.id) as likes_count,
      (SELECT COUNT(*) FROM reel_comment_likes WHERE comment_id = c.id AND user_id = ?) as is_liked
      FROM reel_comments c
      WHERE c.reel_id = ?
      ORDER BY c.created_at ASC
    `, [req.userId, req.params.id]);

    const structured = await Promise.all(comments.filter(c => !c.parent_id).map(async (mc) => {
      const u = await query('SELECT name, avatar FROM users WHERE id = ?', [mc.user_id]);
      const user = u[0] || { name: 'Unknown', avatar: null };

      // Get replies
      const r_raw = comments.filter(r => r.parent_id === mc.id);
      const replies = await Promise.all(r_raw.map(async (r) => {
        const ru = await query('SELECT name, avatar FROM users WHERE id = ?', [r.user_id]);
        return {
          ...r,
          user: { id: r.user_id, name: ru[0]?.name || 'Unknown', avatar: ru[0]?.avatar },
          liked: r.is_liked > 0
        };
      }));

      return {
        ...mc,
        user: { id: mc.user_id, name: user.name, avatar: user.avatar },
        liked: mc.is_liked > 0,
        replies: replies
      };
    }));

    res.json(structured);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add Comment or Reply
router.post('/:id/comments', verifyToken, async (req, res) => {
  try {
    const { content, parent_id } = req.body;
    const result = await reelsRun(
      `INSERT INTO reel_comments (user_id, reel_id, parent_id, content) VALUES (?, ?, ?, ?)`,
      [req.userId, req.params.id, parent_id || null, content]
    );

    // Create notification in main db (velora.db)
    const reel = await reelsQuery('SELECT user_id FROM reels WHERE id = ?', [req.params.id]);
    if (reel.length > 0 && reel[0].user_id !== req.userId) {
      const { run } = require('../db'); // Ensure run helper is available
      await run('INSERT INTO notifications (user_id, actor_id, type, target_id) VALUES (?, ?, ?, ?)', [reel[0].user_id, req.userId, 'reel_comment', req.params.id]);
    }

    res.status(201).json({ success: true, commentId: result.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Like Comment
router.post('/comments/:id/like', verifyToken, async (req, res) => {
  try {
    const commentId = req.params.id;
    const existing = await reelsQuery('SELECT * FROM reel_comment_likes WHERE user_id = ? AND comment_id = ?', [req.userId, commentId]);
    
    if (existing.length > 0) {
      await reelsRun('DELETE FROM reel_comment_likes WHERE user_id = ? AND comment_id = ?', [req.userId, commentId]);
      res.json({ success: true, liked: false });
    } else {
      await reelsRun('INSERT INTO reel_comment_likes (user_id, comment_id) VALUES (?, ?)', [req.userId, commentId]);
      res.json({ success: true, liked: true });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Comment
router.delete('/comments/:id', verifyToken, async (req, res) => {
  try {
    const result = await reelsRun('DELETE FROM reel_comments WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
    if (result.changes === 0) return res.status(403).json({ error: 'Unauthorized to delete this comment' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Edit Comment
router.put('/comments/:id', verifyToken, async (req, res) => {
  try {
    const { content } = req.body;
    const result = await reelsRun('UPDATE reel_comments SET content = ? WHERE id = ? AND user_id = ?', [content, req.params.id, req.userId]);
    if (result.changes === 0) return res.status(403).json({ error: 'Unauthorized to edit this comment' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Hide Reel
router.post('/:id/hide', verifyToken, async (req, res) => {
  try {
    await reelsRun('INSERT OR IGNORE INTO reel_hides (user_id, reel_id) VALUES (?, ?)', [req.userId, req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Share Reel to Feed
router.post('/:id/share', verifyToken, async (req, res) => {
    try {
      const reelId = req.params.id;
      
      // 0. Verify Reel exists in reels.db
      const checkReel = await reelsQuery('SELECT id FROM reels WHERE id = ?', [reelId]);
      if (checkReel.length === 0) {
        console.error(`Share Attempt Failed: Reel with ID ${reelId} not found in reels.db`);
        return res.status(404).json({ error: 'This reel was created in an older version of the app and cannot be shared. Please upload a new reel.' });
      }

      // 1. Create a share record in reels.db
      await reelsRun('INSERT INTO reel_shares (user_id, reel_id) VALUES (?, ?)', [req.userId, reelId]);
      
      // 2. Increment shares_count on reel in reels.db
      await reelsRun('UPDATE reels SET shares_count = shares_count + 1 WHERE id = ?', [reelId]);

      // 3. Create a new post that references this reel in velora.db
      await run(
        `INSERT INTO posts (user_id, content, reel_id) VALUES (?, ?, ?)`,
        [req.userId, 'Shared a reel', reelId]
      );
      
      console.log(`Share Success: Reel ${reelId} shared by User ${req.userId}`);
      res.json({ success: true });
    } catch (error) {
      console.error('SERVER SHARE ERROR:', error);
      res.status(500).json({ error: error.message });
    }
});

module.exports = router;
