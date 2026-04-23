const express = require('express');
const router = express.Router();
const { query, run } = require('../db');
const verifyToken = require('../middleware/auth');

// Get all users (for Find Friends)
router.get('/all', verifyToken, async (req, res) => {
  try {
    const users = await query(`
      SELECT id, name, email, avatar, bio, workplace, college FROM users WHERE id != ? ORDER BY name ASC
    `, [req.userId]);
    
    // Add friend status for each user
    const usersWithStatus = await Promise.all(users.map(async (user) => {
      const friendStatus = await query(`
        SELECT * FROM friends 
        WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
      `, [req.userId, user.id, user.id, req.userId]);
      
      const requestStatus = await query(`
        SELECT status FROM friend_requests 
        WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
      `, [req.userId, user.id, user.id, req.userId]);
      
      return {
        ...user,
        isFriend: friendStatus.length > 0,
        requestStatus: requestStatus[0]?.status || null
      };
    }));
    
    res.json(usersWithStatus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get friends list
router.get('/list', verifyToken, async (req, res) => {
  try {
    const friends = await query(`
      SELECT u.* FROM users u
      JOIN friends f ON (f.user1_id = ? AND f.user2_id = u.id) OR (f.user1_id = u.id AND f.user2_id = ?)
      ORDER BY u.name ASC
    `, [req.userId, req.userId]);
    
    res.json(friends);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check if two users are friends
router.get('/check/:userId', verifyToken, async (req, res) => {
  try {
    const targetId = req.params.userId;
    const isFriend = await query(`
      SELECT * FROM friends 
      WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
    `, [req.userId, targetId, targetId, req.userId]);
    
    res.json({ isFriend: isFriend.length > 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send friend request
router.post('/request/send/:userId', verifyToken, async (req, res) => {
  try {
    const receiverId = req.params.userId;
    
    if (req.userId === parseInt(receiverId)) {
      return res.status(400).json({ error: 'Cannot send request to yourself' });
    }
    
    // Check if already friends
    const existingFriends = await query(`
      SELECT * FROM friends 
      WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
    `, [req.userId, receiverId, receiverId, req.userId]);
    
    if (existingFriends.length > 0) {
      return res.status(400).json({ error: 'Already friends' });
    }
    
    // Check for existing request
    const existing = await query(`
      SELECT * FROM friend_requests 
      WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
    `, [req.userId, receiverId, receiverId, req.userId]);
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Request already exists' });
    }
    
    await run(
      `INSERT INTO friend_requests (sender_id, receiver_id, status) VALUES (?, ?, 'pending')`,
      [req.userId, receiverId]
    );
    
    // Create notification
    await run(
      `INSERT INTO notifications (user_id, actor_id, type, target_id) VALUES (?, ?, ?, ?)`,
      [receiverId, req.userId, 'friend_request', req.userId]
    );
    
    res.json({ success: true, message: 'Friend request sent' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pending friend requests
router.get('/requests/pending', verifyToken, async (req, res) => {
  try {
    const requests = await query(`
      SELECT fr.*, u.name, u.avatar, u.bio FROM friend_requests fr
      JOIN users u ON fr.sender_id = u.id
      WHERE fr.receiver_id = ? AND fr.status = 'pending'
      ORDER BY fr.created_at DESC
    `, [req.userId]);
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get sent friend requests
router.get('/requests/sent', verifyToken, async (req, res) => {
  try {
    const requests = await query(`
      SELECT fr.*, u.name, u.avatar FROM friend_requests fr
      JOIN users u ON fr.receiver_id = u.id
      WHERE fr.sender_id = ? AND fr.status = 'pending'
      ORDER BY fr.created_at DESC
    `, [req.userId]);
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Accept friend request
router.post('/request/accept/:requestId', verifyToken, async (req, res) => {
  try {
    const requestId = req.params.requestId;
    
    const request = await query(`SELECT * FROM friend_requests WHERE id = ? AND receiver_id = ?`, [requestId, req.userId]);
    if (request.length === 0) {
      return res.status(403).json({ error: 'Request not found' });
    }
    
    const senderId = request[0].sender_id;
    
    // Update request status
    await run(`UPDATE friend_requests SET status = 'accepted', updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [requestId]);
    
    // Create friendship (make sure user1_id < user2_id for consistency)
    const user1 = Math.min(req.userId, senderId);
    const user2 = Math.max(req.userId, senderId);
    
    await run(
      `INSERT OR IGNORE INTO friends (user1_id, user2_id) VALUES (?, ?)`,
      [user1, user2]
    );
    
    // Create notification
    await run(
      `INSERT INTO notifications (user_id, actor_id, type, target_id) VALUES (?, ?, ?, ?)`,
      [senderId, req.userId, 'friend_accepted', req.userId]
    );
    
    res.json({ success: true, message: 'Friend request accepted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reject friend request
router.post('/request/reject/:requestId', verifyToken, async (req, res) => {
  try {
    const requestId = req.params.requestId;
    
    const request = await query(`SELECT * FROM friend_requests WHERE id = ? AND receiver_id = ?`, [requestId, req.userId]);
    if (request.length === 0) {
      return res.status(403).json({ error: 'Request not found' });
    }
    
    await run(`UPDATE friend_requests SET status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [requestId]);
    
    res.json({ success: true, message: 'Friend request rejected' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove friend
router.post('/remove/:userId', verifyToken, async (req, res) => {
  try {
    const targetId = req.params.userId;
    const user1 = Math.min(req.userId, targetId);
    const user2 = Math.max(req.userId, targetId);
    
    const result = await run(
      `DELETE FROM friends WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)`,
      [user1, user2, user2, user1]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Friend relationship not found' });
    }
    
    res.json({ success: true, message: 'Friend removed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel friend request
router.post('/request/cancel/:userId', verifyToken, async (req, res) => {
  try {
    const targetId = req.params.userId;
    
    const result = await run(
      `DELETE FROM friend_requests WHERE sender_id = ? AND receiver_id = ? AND status = 'pending'`,
      [req.userId, targetId]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    res.json({ success: true, message: 'Friend request cancelled' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
