const { run, reelsRun } = require('./db');
const bcrypt = require('bcryptjs');

async function seed() {
  console.log('--- VELORA PREMIUM SEEDING PROTOCOL ---');

  // 1. Create Elite Users
  const password = await bcrypt.hash('password123', 10);
  const users = [
    { name: 'Alexander Vault', email: 'alex@velora.com', avatar: 'https://i.pravatar.cc/150?u=alex', bio: 'Architect of digital legacies.' },
    { name: 'Seraphina Luxe', email: 'seraphina@velora.com', avatar: 'https://i.pravatar.cc/150?u=sera', bio: 'Curating the future of aesthetic intelligence.' },
    { name: 'Marcus Sterling', email: 'marcus@velora.com', avatar: 'https://i.pravatar.cc/150?u=marcus', bio: 'Venture strategist. Matrix enthusiast.' }
  ];

  for (const u of users) {
    try {
      await run(`INSERT OR IGNORE INTO users (name, email, password, avatar, bio) VALUES (?, ?, ?, ?, ?)`, 
        [u.name, u.email, password, u.avatar, u.bio]);
      console.log(`User created: ${u.name}`);
    } catch (e) { }
  }

  // 2. Create Premium Groups
  const groups = [
    { name: 'Diamond Network', bio: 'The inner circle of global wealth and asset management.', cover: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800' },
    { name: 'Silicon Valley Insiders', bio: 'Early access to the protocols that will define the next decade.', cover: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800' },
    { name: 'Aesthetic Collective', bio: 'Where high-fashion meets generative digital art.', cover: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800' }
  ];

  for (const g of groups) {
    try {
      await run(`INSERT OR IGNORE INTO groups (name, bio, cover, members_count) VALUES (?, ?, ?, ?)`, 
        [g.name, g.bio, g.cover, Math.floor(Math.random() * 1000) + 500]);
      console.log(`Group created: ${g.name}`);
    } catch (e) { }
  }

  // 3. Create Official Pages
  const pages = [
    { name: 'Velora Official', bio: 'The heartbeat of the network.', cover: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=800' },
    { name: 'Tesla Motors', bio: 'Accelerating the world\'s transition to sustainable energy.', cover: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800' },
    { name: 'SpaceX', bio: 'Making humanity multiplanetary.', cover: 'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?w=800' }
  ];

  for (const p of pages) {
    try {
      await run(`INSERT OR IGNORE INTO pages (name, bio, cover, followers_count) VALUES (?, ?, ?, ?)`, 
        [p.name, p.bio, p.cover, Math.floor(Math.random() * 5000) + 1000]);
      console.log(`Page created: ${p.name}`);
    } catch (e) { }
  }

  // 4. Seed some initial Reels
  const reels = [
    { user_id: 1, caption: 'The future is here. #Velora', video_url: 'https://player.vimeo.com/external/370331493.sd.mp4?s=7b2388109d9e685f0eb21eee0137233D' },
    { user_id: 2, caption: 'Vibes tonight. ✨', video_url: 'https://player.vimeo.com/external/434045526.sd.mp4?s=c27dbed0639918b958c8e100f89025e' }
  ];

  for (const r of reels) {
    try {
      await reelsRun(`INSERT INTO reels (user_id, caption, video_url, shares_count) VALUES (?, ?, ?, ?)`, 
        [r.user_id, r.caption, r.video_url, Math.floor(Math.random() * 100)]);
      console.log('Reel created');
    } catch (e) { }
  }

  // 5. Create Premium Marketplace Listings
  const items = [
    { user_id: 1, title: 'Gulfstream G700 - Private Asset', description: 'Ultra-long-range business jet. Mach 0.925. Protocol: Silent Flight.', price: '$75,000,000', location: 'Dubai International', category: 'Vehicles' },
    { user_id: 2, title: 'Neo-Tokyo Penthouse', description: 'Highest altitude residential unit in the sector. 360-degree matrix view.', price: '$12,500,000', location: 'Shibuya Sky', category: 'Estates' },
    { user_id: 3, title: 'Quantum Neural Link v2', description: 'Direct cortex interface for high-frequency trading and reality-bending.', price: '$250,000', location: 'Silicon Valley', category: 'Tech' },
    { user_id: 1, title: 'Original NFT: The First Genesis', description: 'The code that started it all. Historical digital artifact.', price: '500 ETH', location: 'Velora Blockchain', category: 'Collectibles' }
  ];

  for (const i of items) {
    try {
      await run(`INSERT OR IGNORE INTO marketplace_items (user_id, title, description, price, location, category) VALUES (?, ?, ?, ?, ?, ?)`, 
        [i.user_id, i.title, i.description, i.price, i.location, i.category]);
      console.log(`Marketplace item created: ${i.title}`);
    } catch (e) { }
  }

  console.log('--- SEEDING COMPLETE ---');
}

seed().then(() => process.exit(0)).catch(err => {
  console.error('Seeding failed', err);
  process.exit(1);
});
