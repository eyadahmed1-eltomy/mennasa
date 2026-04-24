const express = require('express');
const router = express.Router();
const { query, run } = require('../db');
const verifyToken = require('../middleware/auth');

// Toggle Follow/Unfollow
router.post('/:id', verifyToken, async (req, res) => {
  try {
    const followingId = req.params.id;
    if (req.userId === parseInt(followingId)) {
        return res.status(400).json({ error: 'You cannot follow yourself' });
    }

    const existing = await query('SELECT * FROM follows WHERE follower_id = ? AND following_id = ?', [req.userId, followingId]);
    
    if (existing.length > 0) {
      await run('DELETE FROM follows WHERE follower_id = ? AND following_id = ?', [req.userId, followingId]);
      res.json({ success: true, following: false });
    } else {
      await run('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)', [req.userId, followingId]);
      // Create notification
      await run('INSERT INTO notifications (user_id, actor_id, type) VALUES (?, ?, ?)', [followingId, req.userId, 'follow']);
      res.json({ success: true, following: true });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check follow status
router.get('/status/:id', verifyToken, async (req, res) => {
  try {
    const targetId = req.params.id;
    const following = await query('SELECT * FROM follows WHERE follower_id = ? AND following_id = ?', [req.userId, targetId]);
    res.json({ following: following.length > 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
