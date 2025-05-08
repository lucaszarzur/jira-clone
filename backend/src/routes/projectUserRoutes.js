const express = require('express');
const router = express.Router();
const projectUserController = require('../controllers/projectUserController');
const { authenticateToken, optionalAuthenticateToken } = require('../middleware/authMiddleware');

// Listar usuários de um projeto
router.get('/projects/:projectId/users', projectUserController.getProjectUsers);

// Adicionar usuário a um projeto (requer autenticação)
router.post('/projects/:projectId/users', authenticateToken, projectUserController.addUserToProject);

// Atualizar função de um usuário em um projeto (requer autenticação)
router.put('/projects/:projectId/users/:userId', authenticateToken, projectUserController.updateUserRole);

// Remover usuário de um projeto (requer autenticação)
router.delete('/projects/:projectId/users/:userId', authenticateToken, projectUserController.removeUserFromProject);

// Listar usuários disponíveis para adicionar a um projeto (requer autenticação)
router.get('/projects/:projectId/available-users', authenticateToken, projectUserController.getAvailableUsers);

module.exports = router;
