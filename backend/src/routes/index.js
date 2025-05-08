const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const projectRoutes = require('./projectRoutes');
const issueRoutes = require('./issueRoutes');
const commentRoutes = require('./commentRoutes');
const permissionRoutes = require('./permissionRoutes');
const projectUserRoutes = require('./projectUserRoutes');

// Authentication routes
router.use('/auth', authRoutes);

// Resource routes
router.use('/users', userRoutes);
router.use('/projects', projectRoutes);
router.use('/issues', issueRoutes);
router.use('/comments', commentRoutes);
router.use('/permissions', permissionRoutes);
router.use('/', projectUserRoutes); // Rotas de usuários em projetos

module.exports = router;
