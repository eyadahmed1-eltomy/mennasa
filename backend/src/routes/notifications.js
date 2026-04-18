const express = require('express');
const router = express.Router();
const { query, run } = require('../db');
const verifyToken = require('../middleware/auth');

// Get current user notifications
router.get('/', verifyToken, async (req, res) => {
  try {
    const notifications = await query(`
      SELECT n.*, u.name as actor_name, u.avatar as actor_avatar
      FROM notifications n
      JOIN users u ON n.actor_id = u.id
      WHERE n.user_id = ?
      ORDER BY n.created_at DESC
      LIMIT 20
    `, [req.userId]);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark all as read
router.post('/read', verifyToken, async (req, res) => {
  try {
    await run('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [req.userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
