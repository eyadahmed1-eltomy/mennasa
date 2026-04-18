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
    cb(null, 'market-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Get all marketplace listings
router.get('/', verifyToken, async (req, res) => {
  try {
    const items = await query(`
      SELECT m.*, u.name as seller_name, u.avatar as seller_avatar 
      FROM marketplace_items m
      JOIN users u ON m.user_id = u.id
      ORDER BY m.created_at DESC
    `);
    
    const formatted = items.map(item => ({
      ...item,
      image: item.image ? `http://localhost:5000/uploads/${path.basename(item.image)}` : null
    }));
    
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's own listings
router.get('/my', verifyToken, async (req, res) => {
  try {
    const items = await query(`SELECT * FROM marketplace_items WHERE user_id = ?`, [req.userId]);
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new listing
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { title, description, price, condition, location, category } = req.body;
    const imagePath = req.file ? req.file.path.replace(/\\\\/g, '/') : null;

    if (!title || !price) {
      return res.status(400).json({ error: 'Title and price are required' });
    }

    const result = await run(
      `INSERT INTO marketplace_items (user_id, title, description, price, image, condition, location, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.userId, title, description, price, imagePath, condition || 'New', location, category]
    );

    res.status(201).json({ success: true, itemId: result.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete listing
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const result = await run(`DELETE FROM marketplace_items WHERE id = ? AND user_id = ?`, [req.params.id, req.userId]);
    if (result.changes === 0) return res.status(403).json({ error: 'Unauthorized to delete this listing' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
