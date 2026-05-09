const { getPool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Create new issue
const createIssue = async (req, res) => {
  try {
    const { category, title, description, ward, latitude, longitude, address, priority, anonymous, photo_url } = req.body;
    const { userId } = req.params;

    if (!category || !title || !ward) {
      return res.status(400).json({ error: 'Category, title, and ward are required' });
    }

    const pool = await getPool();
    const issueId = `ISS${String(Date.now()).slice(-9)}`;

    // Get user info
    const userResult = await pool.query('SELECT name FROM users WHERE user_id = $1', [userId]);
    const reporterName = userResult.rows.length > 0 ? userResult.rows[0].name : 'Anonymous';

    // Insert issue
    const result = await pool.query(
      `INSERT INTO issues (issue_id, category, title, description, ward, latitude, longitude, address, priority, reported_by, reporter_name, anonymous, photo_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [issueId, category, title, description, ward, latitude, longitude, address, priority || 'medium', userId, reporterName, anonymous ? true : false, photo_url || null]
    );

    // Insert timeline entry
    const timelineId = uuidv4();
    await pool.query(
      `INSERT INTO issue_timeline (timeline_id, issue_id, status, note)
       VALUES ($1, $2, $3, $4)`,
      [timelineId, issueId, 'reported', 'Issue reported by citizen']
    );

    // Update user civic score
    await pool.query('UPDATE users SET civic_score = civic_score + 10, issues_reported = issues_reported + 1 WHERE user_id = $1', [userId]);

    res.status(201).json({
      success: true,
      message: 'Issue reported successfully',
      issue: result.rows[0]
    });
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all issues
const getIssues = async (req, res) => {
  try {
    const { ward, status, category, limit = 50, offset = 0 } = req.query;
    const pool = await getPool();

    let query = 'SELECT * FROM issues WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (ward) {
      query += ` AND ward = $${paramCount}`;
      params.push(ward);
      paramCount++;
    }
    if (status) {
      query += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }
    if (category) {
      query += ` AND category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);
    res.json({ issues: result.rows });
  } catch (error) {
    console.error('Get issues error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get single issue with comments
const getIssueById = async (req, res) => {
  try {
    const { issueId } = req.params;
    const pool = await getPool();

    // Get issue
    const issueResult = await pool.query('SELECT * FROM issues WHERE issue_id = $1', [issueId]);

    if (issueResult.rows.length === 0) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const issue = issueResult.rows[0];

    // Get comments
    const commentsResult = await pool.query('SELECT * FROM comments WHERE issue_id = $1 ORDER BY created_at DESC', [issueId]);

    // Get timeline
    const timelineResult = await pool.query('SELECT * FROM issue_timeline WHERE issue_id = $1 ORDER BY created_at ASC', [issueId]);

    // Get upvotes count
    const upvotesResult = await pool.query('SELECT COUNT(*) as upvotes FROM upvotes WHERE issue_id = $1', [issueId]);

    res.json({
      issue: { ...issue, upvotes: parseInt(upvotesResult.rows[0].upvotes) },
      comments: commentsResult.rows,
      timeline: timelineResult.rows
    });
  } catch (error) {
    console.error('Get issue error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update issue status
const updateIssueStatus = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { status, note } = req.body;
    const pool = await getPool();

    // Update issue
    await pool.query('UPDATE issues SET status = $1, updated_at = NOW() WHERE issue_id = $2', [status, issueId]);

    // Add timeline entry
    const timelineId = uuidv4();
    await pool.query(
      `INSERT INTO issue_timeline (timeline_id, issue_id, status, note)
       VALUES ($1, $2, $3, $4)`,
      [timelineId, issueId, status, note || '']
    );

    res.json({ success: true, message: 'Issue status updated' });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Upvote issue
const upvoteIssue = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { userId } = req.body;
    const pool = await getPool();

    // Check if already upvoted
    const existing = await pool.query('SELECT upvote_id FROM upvotes WHERE issue_id = $1 AND user_id = $2', [issueId, userId]);

    if (existing.rows.length > 0) {
      // Remove upvote
      await pool.query('DELETE FROM upvotes WHERE issue_id = $1 AND user_id = $2', [issueId, userId]);
    } else {
      // Add upvote
      const upvoteId = uuidv4();
      await pool.query(
        `INSERT INTO upvotes (upvote_id, issue_id, user_id)
         VALUES ($1, $2, $3)`,
        [upvoteId, issueId, userId]
      );

      // Update user civic score
      await pool.query('UPDATE users SET civic_score = civic_score + 2 WHERE user_id = $1', [userId]);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Upvote error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createIssue, getIssues, getIssueById, updateIssueStatus, upvoteIssue };
