const { getPool } = require('../config/database');
const { generateToken } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Verify OTP and Login
const loginUser = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and OTP required' });
    }

    // Verify OTP (using 1234 as demo)
    if (otp !== '1234') {
      return res.status(401).json({ error: 'Invalid OTP' });
    }

    // Check if this is the admin phone number
    const isAdminPhone = phone === '9999999999';
    
    const pool = await getPool();
    const result = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);

    let user;
    if (result.rows.length === 0) {
      // Create new user if doesn't exist (guest login)
      const userId = `user_${phone}`;
      await pool.query(
        `INSERT INTO users (user_id, phone, name, avatar, avatar_color, civic_score, tier, is_admin, bio, ward, zone)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          userId, 
          phone, 
          isAdminPhone ? 'Admin User' : 'Citizen', 
          isAdminPhone ? 'AD' : 'C', 
          isAdminPhone ? '#ef233c' : '#4361ee', 
          0, 
          isAdminPhone ? 'Admin' : 'New', 
          isAdminPhone,
          isAdminPhone ? 'BBMP Administrative Officer - Manages all wards' : null,
          null,
          isAdminPhone ? 'All' : null
        ]
      );
      // Fetch the newly created user with all fields
      const newUserResult = await pool.query('SELECT * FROM users WHERE user_id = $1', [userId]);
      user = newUserResult.rows[0];
    } else {
      user = result.rows[0];
      
      // If admin phone, always ensure is_admin is true
      if (isAdminPhone) {
        await pool.query(
          `UPDATE users SET is_admin = true, name = $2, avatar = $3, avatar_color = $4, tier = $5, bio = $6, ward = $7, zone = $8 
           WHERE user_id = $1`,
          [user.user_id, 'Admin User', 'AD', '#ef233c', 'Admin', 'BBMP Administrative Officer - Manages all wards', null, 'All']
        );
        // Fetch updated user to ensure we have the latest is_admin value
        const updatedUserResult = await pool.query('SELECT * FROM users WHERE user_id = $1', [user.user_id]);
        user = updatedUserResult.rows[0];
      } else {
        // Update last login for non-admin users
        await pool.query('UPDATE users SET last_login = NOW() WHERE user_id = $1', [user.user_id]);
      }
    }

    const token = generateToken(user.user_id, phone);
    
    // Ensure is_admin is a boolean
    user.is_admin = Boolean(user.is_admin);
    
    console.log('Login successful - Phone:', phone, 'is_admin:', user.is_admin, 'User:', user.name);
    
    res.json({ success: true, token, user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Register new user
const registerUser = async (req, res) => {
  try {
    const { phone, name, email, ward, area, address, pincode } = req.body;

    if (!phone || !name || !ward) {
      return res.status(400).json({ error: 'Phone, name, and ward are required' });
    }

    const pool = await getPool();
    const userId = `user_${phone}`;

    // Check if user already exists
    const existing = await pool.query('SELECT user_id FROM users WHERE phone = $1', [phone]);

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Insert new user
    await pool.query(
      `INSERT INTO users (user_id, phone, name, email, ward, area, address, pincode, avatar, avatar_color, civic_score, tier)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [userId, phone, name, email || null, ward, area || null, address || null, pincode || null, name.substring(0, 2).toUpperCase(), '#4361ee', 0, 'New']
    );

    const token = generateToken(userId, phone);
    res.json({
      success: true,
      message: 'User registered successfully',
      token,
      user: { user_id: userId, phone, name, ward }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const pool = await getPool();

    const result = await pool.query('SELECT * FROM users WHERE user_id = $1', [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { loginUser, registerUser, getUserProfile };
