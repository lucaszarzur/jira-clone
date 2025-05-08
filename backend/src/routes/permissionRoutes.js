const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permissionController');
const { authenticateToken, checkProjectPermission } = require('../middleware/authMiddleware');

// Get all permissions for a project (requires admin permission)
router.get('/project/:projectId', 
  authenticateToken, 
  checkProjectPermission('admin'), 
  permissionController.getProjectPermissions
);

// Get user permission for a project
router.get('/project/:projectId/user/:userId', 
  authenticateToken, 
  checkProjectPermission('admin'), 
  permissionController.getUserProjectPermission
);

// Add or update user permission for a project
router.put('/project/:projectId/user/:userId', 
  authenticateToken, 
  checkProjectPermission('admin'), 
  permissionController.updateUserProjectPermission
);

// Remove user permission from a project
router.delete('/project/:projectId/user/:userId', 
  authenticateToken, 
  checkProjectPermission('admin'), 
  permissionController.removeUserProjectPermission
);

module.exports = router;
