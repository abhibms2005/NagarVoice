const express = require('express');
const { loginUser, registerUser, getUserProfile } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { getPool } = require('../config/database');

const router = express.Router();

// Public routes
router.post('/login', loginUser);
router.post('/register', registerUser);

// Initialize admin user (call once if needed)
router.post('/init-admin', async (req, res) => {
  try {
    const pool = await getPool();
    const adminPhone = '9999999999';
    const userId = `user_${adminPhone}`;
    
    // Check if admin user exists
    const result = await pool.query('SELECT * FROM users WHERE phone = $1', [adminPhone]);
    
    if (result.rows.length === 0) {
      // Create admin user
      await pool.query(
        `INSERT INTO users (user_id, phone, name, avatar, avatar_color, civic_score, tier, is_admin, bio, ward, zone)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          userId, 
          adminPhone, 
          'Admin User', 
          'AD', 
          '#ef233c', 
          0, 
          'Admin', 
          true,
          'BBMP Administrative Officer - Manages all wards',
          null,
          'All'
        ]
      );
      res.json({ success: true, message: 'Admin user created successfully' });
    } else {
      // Update existing admin user to ensure is_admin is true
      await pool.query(
        `UPDATE users SET is_admin = true, name = $2, avatar = $3, avatar_color = $4, tier = $5, bio = $6, ward = $7, zone = $8 
         WHERE user_id = $1`,
        [userId, 'Admin User', 'AD', '#ef233c', 'Admin', 'BBMP Administrative Officer - Manages all wards', null, 'All']
      );
      res.json({ success: true, message: 'Admin user updated successfully' });
    }
  } catch (error) {
    console.error('Init admin error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Protected routes
router.get('/profile/:userId', authenticateToken, getUserProfile);

module.exports = router;
