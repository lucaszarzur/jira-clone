const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issueController');

// Rotas para issues
router.get('/', issueController.getAllIssues);
router.get('/:id', issueController.getIssueById);
router.post('/', issueController.createIssue);
router.put('/:id', issueController.updateIssue);
router.delete('/:id', issueController.deleteIssue);

module.exports = router;
