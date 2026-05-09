// Frontend API Service for Authentication
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Login user
export const loginUser = async (phone, otp) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp })
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    
    // Store token and user in localStorage
    localStorage.setItem('nagarvoice_token', data.token);
    localStorage.setItem('nagarvoice_user', JSON.stringify(data.user));
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Register user
export const registerUser = async (phone, name, email, ward, area, address, pincode) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, name, email, ward, area, address, pincode })
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Get user profile
export const getUserProfile = async (userId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/profile/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }

    return await response.json();
  } catch (error) {
    console.error('Get profile error:', error);
    throw error;
  }
};

// Get current user from localStorage
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('nagarvoice_user');
  return userStr ? JSON.parse(userStr) : null;
};

// Get current token
export const getToken = () => {
  return localStorage.getItem('nagarvoice_token');
};

// Logout
export const logoutUser = () => {
  localStorage.removeItem('nagarvoice_token');
  localStorage.removeItem('nagarvoice_user');
};
