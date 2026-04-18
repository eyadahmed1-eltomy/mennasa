const express = require('express');
const router = express.Router();
const { query, run } = require('../db');
const verifyToken = require('../middleware/auth');

// Get all groups
router.get('/', verifyToken, async (req, res) => {
  try {
    const groups = await query(`SELECT * FROM groups ORDER BY members_count DESC`);
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's groups
router.get('/my', verifyToken, async (req, res) => {
  try {
    const joinedGroups = await query(`SELECT group_id FROM group_members WHERE user_id = ?`, [req.userId]);
    res.json(joinedGroups.map(g => g.group_id));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Join group toggle
router.post('/:id/join', verifyToken, async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.userId;

    const existing = await query('SELECT * FROM group_members WHERE user_id = ? AND group_id = ?', [userId, groupId]);
    
    if (existing.length > 0) {
      // Leave
      await run('DELETE FROM group_members WHERE user_id = ? AND group_id = ?', [userId, groupId]);
      await run('UPDATE groups SET members_count = MAX(0, members_count - 1) WHERE id = ?', [groupId]);
      res.json({ success: true, joined: false });
    } else {
      // Join
      await run('INSERT INTO group_members (user_id, group_id) VALUES (?, ?)', [userId, groupId]);
      await run('UPDATE groups SET members_count = members_count + 1 WHERE id = ?', [groupId]);
      res.json({ success: true, joined: true });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
