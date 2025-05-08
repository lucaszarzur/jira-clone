'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Buscar usuários e projetos existentes
    const projectUsers = await queryInterface.sequelize.query(
      'SELECT userId, projectId FROM project_users;',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (projectUsers.length === 0) {
      console.log('Não há associações de usuários e projetos para atualizar');
      return;
    }

    // Atualizar as funções dos usuários
    const updates = [];
    
    // Definir o primeiro usuário como ADMIN em todos os projetos
    const firstUser = projectUsers[0].userId;
    
    for (const pu of projectUsers) {
      let role = 'VIEWER';
      
      // O primeiro usuário é ADMIN em todos os projetos
      if (pu.userId === firstUser) {
        role = 'ADMIN';
      } 
      // Alternar entre MEMBER e VIEWER para os outros usuários
      else {
        // Usar o hash do userId para determinar a função (para consistência)
        const hash = pu.userId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
        role = hash % 2 === 0 ? 'MEMBER' : 'VIEWER';
      }
      
      updates.push(
        queryInterface.sequelize.query(
          `UPDATE project_users SET role = '${role}' WHERE userId = '${pu.userId}' AND projectId = '${pu.projectId}'`
        )
      );
    }

    await Promise.all(updates);
    console.log(`Atualizadas ${updates.length} associações de usuários e projetos`);
  },

  down: async (queryInterface, Sequelize) => {
    // Reverter para VIEWER
    await queryInterface.sequelize.query(
      `UPDATE project_users SET role = 'VIEWER'`
    );
  }
};
