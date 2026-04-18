const express = require('express');
const router = express.Router();
const { query, run } = require('../db');
const verifyToken = require('../middleware/auth');

// Get all conversations for the logged-in user
router.get('/conversations', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    // Fetch conversations where the user is either user1 or user2
    const convos = await query(`
      SELECT c.*, 
             u.name as other_name, u.avatar as other_avatar, u.id as other_id,
             (SELECT text FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) as last_message
      FROM conversations c
      JOIN users u ON (c.user1_id = u.id OR c.user2_id = u.id)
      WHERE (c.user1_id = ? OR c.user2_id = ?) AND u.id != ?
      ORDER BY c.last_message_at DESC
    `, [userId, userId, userId]);
    
    res.json(convos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get messages for a specific conversation
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const convoId = req.params.id;
    const messages = await query(`
      SELECT m.*, u.name as sender_name, u.avatar as sender_avatar
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = ?
      ORDER BY m.created_at ASC
    `, [convoId]);
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send a message / New conversation
router.post('/', verifyToken, async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    const senderId = req.userId;

    if (!receiverId || !text) {
      return res.status(400).json({ error: 'Receiver and text are required' });
    }

    // 1. Check if conversation exists
    let convo = await query(`
      SELECT id FROM conversations 
      WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
    `, [senderId, receiverId, receiverId, senderId]);

    let convoId;
    if (convo.length === 0) {
      // Create new conversation
      const result = await run(`INSERT INTO conversations (user1_id, user2_id) VALUES (?, ?)`, [senderId, receiverId]);
      convoId = result.id;
    } else {
      convoId = convo[0].id;
    }

    // 2. Insert message
    await run(`INSERT INTO messages (conversation_id, sender_id, text) VALUES (?, ?, ?)`, [convoId, senderId, text]);
    
    // 3. Update last_message_at in conversation
    await run(`UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE id = ?`, [convoId]);

    res.status(201).json({ success: true, conversationId: convoId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
