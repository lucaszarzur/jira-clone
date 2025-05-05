const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

// Rotas para comentários
router.get('/', commentController.getAllComments);
router.get('/issue/:issueId', commentController.getCommentsByIssueId);
router.get('/:id', commentController.getCommentById);
router.post('/', commentController.createComment);
router.put('/:id', commentController.updateComment);
router.delete('/:id', commentController.deleteComment);

module.exports = router;
