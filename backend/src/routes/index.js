const express = require('express');
const router = express.Router();

const userRoutes = require('./userRoutes');
const projectRoutes = require('./projectRoutes');
const issueRoutes = require('./issueRoutes');
const commentRoutes = require('./commentRoutes');

router.use('/users', userRoutes);
router.use('/projects', projectRoutes);
router.use('/issues', issueRoutes);
router.use('/comments', commentRoutes);

module.exports = router;
