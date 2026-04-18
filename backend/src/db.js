const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure database directory exists
const dbDir = path.join(__dirname, '../database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'velora.db');
const reelsDbPath = path.join(dbDir, 'reels.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Error opening velora.db', err);
  else {
    console.log('Connected to velora.db');
    db.serialize(() => {
      db.run('PRAGMA foreign_keys = ON');
      // Main Tables
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        name TEXT NOT NULL, 
        email TEXT UNIQUE NOT NULL, 
        password TEXT NOT NULL, 
        avatar TEXT, 
        cover TEXT, 
        bio TEXT,
        workplace TEXT,
        college TEXT,
        high_school TEXT,
        current_city TEXT,
        hometown TEXT,
        relationship TEXT,
        phone TEXT,
        website TEXT,
        gender TEXT,
        birth_date TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
      db.run(`CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, content TEXT, image TEXT, reel_id INTEGER DEFAULT NULL, feeling TEXT, location TEXT, likes INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users (id))`);
      db.run(`ALTER TABLE posts ADD COLUMN reel_id INTEGER DEFAULT NULL`, (err) => { });
      db.run(`ALTER TABLE posts ADD COLUMN feeling TEXT`, (err) => { });
      db.run(`ALTER TABLE posts ADD COLUMN location TEXT`, (err) => { });
      
      db.run(`CREATE TABLE IF NOT EXISTS post_likes (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, post_id INTEGER NOT NULL, UNIQUE(user_id, post_id), FOREIGN KEY (user_id) REFERENCES users (id), FOREIGN KEY (post_id) REFERENCES posts (id))`);
      db.run(`CREATE TABLE IF NOT EXISTS comments (id INTEGER PRIMARY KEY AUTOINCREMENT, post_id INTEGER NOT NULL, user_id INTEGER NOT NULL, content TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (post_id) REFERENCES posts (id), FOREIGN KEY (user_id) REFERENCES users (id))`);
      db.run(`CREATE TABLE IF NOT EXISTS follows (id INTEGER PRIMARY KEY AUTOINCREMENT, follower_id INTEGER NOT NULL, following_id INTEGER NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, UNIQUE(follower_id, following_id), FOREIGN KEY (follower_id) REFERENCES users (id), FOREIGN KEY (following_id) REFERENCES users (id))`);
      
      // Stories Table
      db.run(`CREATE TABLE IF NOT EXISTS stories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        media_url TEXT NOT NULL,
        type TEXT DEFAULT 'image',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`);

      // Notifications Table
      db.run(`CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        actor_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        target_id INTEGER,
        is_read INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (actor_id) REFERENCES users (id)
      )`);

      // Messaging System
      db.run(`CREATE TABLE IF NOT EXISTS conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user1_id INTEGER NOT NULL,
        user2_id INTEGER NOT NULL,
        last_message_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user1_id, user2_id),
        FOREIGN KEY (user1_id) REFERENCES users (id),
        FOREIGN KEY (user2_id) REFERENCES users (id)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id INTEGER NOT NULL,
        sender_id INTEGER NOT NULL,
        text TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES conversations (id),
        FOREIGN KEY (sender_id) REFERENCES users (id)
      )`);

      // Groups System
      db.run(`CREATE TABLE IF NOT EXISTS groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        bio TEXT,
        cover TEXT,
        members_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS group_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        group_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        UNIQUE(group_id, user_id),
        FOREIGN KEY (group_id) REFERENCES groups (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`);

      // Pages System
      db.run(`CREATE TABLE IF NOT EXISTS pages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        bio TEXT,
        cover TEXT,
        followers_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS page_likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        page_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        UNIQUE(page_id, user_id),
        FOREIGN KEY (page_id) REFERENCES pages (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`);

      // Marketplace System
      db.run(`CREATE TABLE IF NOT EXISTS marketplace_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        price TEXT NOT NULL,
        image TEXT,
        condition TEXT DEFAULT 'New',
        location TEXT,
        category TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`);
    });
  }
});

const reelsDb = new sqlite3.Database(reelsDbPath, (err) => {
  if (err) console.error('Error opening reels.db', err);
  else {
    console.log('Connected to reels.db (Dedicated Reels System)');
    reelsDb.serialize(() => {
      reelsDb.run('PRAGMA foreign_keys = ON');
      // Reels System Tables
      reelsDb.run(`CREATE TABLE IF NOT EXISTS reels (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, caption TEXT, video_url TEXT NOT NULL, shares_count INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
      reelsDb.run(`CREATE TABLE IF NOT EXISTS reel_likes (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, reel_id INTEGER NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, UNIQUE(user_id, reel_id), FOREIGN KEY (reel_id) REFERENCES reels (id))`);
      reelsDb.run(`CREATE TABLE IF NOT EXISTS reel_comments (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, reel_id INTEGER NOT NULL, parent_id INTEGER DEFAULT NULL, content TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (reel_id) REFERENCES reels (id), FOREIGN KEY (parent_id) REFERENCES reel_comments (id) ON DELETE CASCADE)`);
      reelsDb.run(`CREATE TABLE IF NOT EXISTS reel_comment_likes (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, comment_id INTEGER NOT NULL, UNIQUE(user_id, comment_id), FOREIGN KEY (comment_id) REFERENCES reel_comments (id) ON DELETE CASCADE)`);
      reelsDb.run(`CREATE TABLE IF NOT EXISTS reel_hides (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, reel_id INTEGER NOT NULL, UNIQUE(user_id, reel_id), FOREIGN KEY (reel_id) REFERENCES reels (id))`);
      reelsDb.run(`CREATE TABLE IF NOT EXISTS reel_shares (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, reel_id INTEGER NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (reel_id) REFERENCES reels (id))`);
      console.log('Reels table structure verified in reels.db.');
    });
  }
});

// Helper for Promisified Queries
const query = (sql, params = []) => new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => { if (err) reject(err); else resolve(rows); });
});

const run = (sql, params = []) => new Promise((resolve, reject) => {
    db.run(sql, params, function (err) { if (err) reject(err); else resolve({ id: this.lastID, changes: this.changes }); });
});

// Reels DB Helpers
const reelsQuery = (sql, params = []) => new Promise((resolve, reject) => {
    reelsDb.all(sql, params, (err, rows) => { if (err) reject(err); else resolve(rows); });
});

const reelsRun = (sql, params = []) => new Promise((resolve, reject) => {
    reelsDb.run(sql, params, function (err) { if (err) reject(err); else resolve({ id: this.lastID, changes: this.changes }); });
});

module.exports = { db, reelsDb, query, run, reelsQuery, reelsRun };
