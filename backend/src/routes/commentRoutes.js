const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Public routes - get comments
router.get('/', commentController.getAllComments);
router.get('/issue/:issueId', commentController.getCommentsByIssueId);
router.get('/:id', commentController.getCommentById);

// Protected routes - require authentication
router.post('/', authenticateToken, commentController.createComment);
router.put('/:id', authenticateToken, commentController.updateComment);
router.delete('/:id', authenticateToken, commentController.deleteComment);

module.exports = router;
