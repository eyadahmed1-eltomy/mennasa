const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const bearerHeader = req.headers['authorization'];
  if (!bearerHeader) return res.status(403).json({ error: 'No token provided' });

  const token = bearerHeader.split(' ')[1];
  
  jwt.verify(token, process.env.JWT_SECRET || 'velora-secret-key-12345', (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Failed to authenticate token' });
    req.userId = decoded.id; // Save to request for use in other routes
    next();
  });
};

module.exports = verifyToken;
