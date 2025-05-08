'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Buscar usuários e projetos existentes
    const users = await queryInterface.sequelize.query(
      'SELECT id FROM users;',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const projects = await queryInterface.sequelize.query(
      'SELECT id FROM projects;',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (users.length === 0 || projects.length === 0) {
      console.log('Não há usuários ou projetos para associar');
      return;
    }

    // Criar associações entre usuários e projetos
    const projectUsers = [];
    
    // Adicionar o primeiro usuário como ADMIN em todos os projetos
    projects.forEach(project => {
      projectUsers.push({
        id: uuidv4(),
        userId: users[0].id,
        projectId: project.id,
        role: 'ADMIN',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    // Adicionar outros usuários como MEMBER ou VIEWER em alguns projetos
    for (let i = 1; i < Math.min(users.length, 5); i++) {
      for (let j = 0; j < Math.min(projects.length, 3); j++) {
        // Alternar entre MEMBER e VIEWER
        const role = i % 2 === 0 ? 'MEMBER' : 'VIEWER';
        
        projectUsers.push({
          id: uuidv4(),
          userId: users[i].id,
          projectId: projects[j].id,
          role,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

    await queryInterface.bulkInsert('project_users', projectUsers);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('project_users', null, {});
  }
};
