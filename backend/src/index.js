require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

// Initialize the database connection (this will create tables on startup)
require('./db');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const messageRoutes = require('./routes/messages');
const groupRoutes = require('./routes/groups');
const pageRoutes = require('./routes/pages');
const marketplaceRoutes = require('./routes/marketplace');
const notificationRoutes = require('./routes/notifications');
const reelRoutes = require('./routes/reels');
const followRoutes = require('./routes/follows');
const storyRoutes = require('./routes/stories');
const friendsRoutes = require('./routes/friends');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

// Serve uploads directory securely mappings natively to the user's PC drive (backend/uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reels', reelRoutes);
app.use('/api/follows', followRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/friends', friendsRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', name: 'Velora API', timestamp: new Date().toISOString() });
});

// 404 handler - ensure it returns JSON
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler - ensure all errors return JSON
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Socket.io for real-time messaging
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', (roomId) => socket.join(roomId));

  socket.on('send_message', (data) => {
    io.to(data.roomId).emit('receive_message', data);
  });

  socket.on('typing', (data) => {
    socket.to(data.roomId).emit('user_typing', data);
  });

  socket.on('disconnect', () => console.log('User disconnected:', socket.id));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Velora API running on port ${PORT}`));
