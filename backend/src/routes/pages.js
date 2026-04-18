const express = require('express');
const router = express.Router();
const { query, run } = require('../db');
const verifyToken = require('../middleware/auth');

// Get all pages
router.get('/', verifyToken, async (req, res) => {
  try {
    const pages = await query(`SELECT * FROM pages ORDER BY followers_count DESC`);
    res.json(pages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's liked pages
router.get('/liked', verifyToken, async (req, res) => {
  try {
    const likedPages = await query(`SELECT page_id FROM page_likes WHERE user_id = ?`, [req.userId]);
    res.json(likedPages.map(p => p.page_id));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Like page toggle
router.post('/:id/like', verifyToken, async (req, res) => {
  try {
    const pageId = req.params.id;
    const userId = req.userId;

    const existing = await query('SELECT * FROM page_likes WHERE user_id = ? AND page_id = ?', [userId, pageId]);
    
    if (existing.length > 0) {
      // Unlike
      await run('DELETE FROM page_likes WHERE user_id = ? AND page_id = ?', [userId, pageId]);
      await run('UPDATE pages SET followers_count = MAX(0, followers_count - 1) WHERE id = ?', [pageId]);
      res.json({ success: true, liked: false });
    } else {
      // Like
      await run('INSERT INTO page_likes (user_id, page_id) VALUES (?, ?)', [userId, pageId]);
      await run('UPDATE pages SET followers_count = followers_count + 1 WHERE id = ?', [pageId]);
      res.json({ success: true, liked: true });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
