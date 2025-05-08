const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issueController');
const { authenticateToken, checkProjectPermission } = require('../middleware/authMiddleware');

// Public routes - get all issues and get issue by id
router.get('/', issueController.getAllIssues);
router.get('/:id', issueController.getIssueById);

// Protected routes - require authentication
router.post('/', authenticateToken, issueController.createIssue);
router.put('/:id', authenticateToken, issueController.updateIssue);
router.delete('/:id', authenticateToken, issueController.deleteIssue);

module.exports = router;
