'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Adicionar a coluna role à tabela project_users
    await queryInterface.addColumn('project_users', 'role', {
      type: Sequelize.ENUM('ADMIN', 'MEMBER', 'VIEWER'),
      allowNull: false,
      defaultValue: 'VIEWER'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remover a coluna role da tabela project_users
    await queryInterface.removeColumn('project_users', 'role');
  }
};
