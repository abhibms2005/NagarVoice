// Frontend API Service for Issues
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Helper to get token
const getToken = () => localStorage.getItem('nagarvoice_token');

// Get all issues
export const getIssues = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.ward) params.append('ward', filters.ward);
    if (filters.status) params.append('status', filters.status);
    if (filters.category) params.append('category', filters.category);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);

    const response = await fetch(`${API_BASE_URL}/issues?${params.toString()}`);

    if (!response.ok) {
      throw new Error('Failed to fetch issues');
    }

    return await response.json();
  } catch (error) {
    console.error('Get issues error:', error);
    throw error;
  }
};

// Get single issue
export const getIssueById = async (issueId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/issues/${issueId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch issue');
    }

    return await response.json();
  } catch (error) {
    console.error('Get issue error:', error);
    throw error;
  }
};

// Create new issue
export const createIssue = async (userId, issueData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/issues/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(issueData)
    });

    if (!response.ok) {
      throw new Error('Failed to create issue');
    }

    return await response.json();
  } catch (error) {
    console.error('Create issue error:', error);
    throw error;
  }
};

// Update issue status
export const updateIssueStatus = async (issueId, status, note) => {
  try {
    const response = await fetch(`${API_BASE_URL}/issues/${issueId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ status, note })
    });

    if (!response.ok) {
      throw new Error('Failed to update issue');
    }

    return await response.json();
  } catch (error) {
    console.error('Update issue error:', error);
    throw error;
  }
};

// Upvote issue
export const upvoteIssue = async (issueId, userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/issues/${issueId}/upvote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ userId })
    });

    if (!response.ok) {
      throw new Error('Failed to upvote');
    }

    return await response.json();
  } catch (error) {
    console.error('Upvote error:', error);
    throw error;
  }
};
