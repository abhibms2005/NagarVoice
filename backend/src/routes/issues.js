const express = require('express');
const { createIssue, getIssues, getIssueById, updateIssueStatus, upvoteIssue } = require('../controllers/issueController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getIssues);
router.get('/:issueId', getIssueById);

// Protected routes
router.post('/:userId', authenticateToken, createIssue);
router.patch('/:issueId/status', authenticateToken, updateIssueStatus);
router.post('/:issueId/upvote', authenticateToken, upvoteIssue);

module.exports = router;
