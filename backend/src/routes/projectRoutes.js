const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authenticateToken, optionalAuthenticateToken, isAdmin, checkProjectPermission } = require('../middleware/authMiddleware');

// Semi-public routes - can be accessed without authentication, but authentication is used if provided
router.get('/', optionalAuthenticateToken, projectController.getAllProjects);
router.get('/:id', optionalAuthenticateToken, projectController.getProjectById);

// Protected routes - require authentication
router.post('/', authenticateToken, projectController.createProject);
router.put('/:id', authenticateToken, checkProjectPermission('admin'), projectController.updateProject);
router.delete('/:id', authenticateToken, checkProjectPermission('admin'), projectController.deleteProject);

module.exports = router;
