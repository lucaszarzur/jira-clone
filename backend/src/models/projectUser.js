const { DataTypes } = require('sequelize');

// Definição de funções de usuário em projetos
const UserRoles = {
  ADMIN: 'ADMIN',     // Pode gerenciar o projeto, usuários e todas as issues
  MEMBER: 'MEMBER',   // Pode criar e editar issues, mas não gerenciar o projeto
  VIEWER: 'VIEWER'    // Pode apenas visualizar o projeto e as issues
};

const ProjectUser = (sequelize) => sequelize.define('ProjectUser', {
  userId: {
    type: DataTypes.STRING(255),
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  projectId: {
    type: DataTypes.STRING(255),
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'projects',
      key: 'id'
    }
  },
  role: {
    type: DataTypes.ENUM(Object.values(UserRoles)),
    allowNull: false,
    defaultValue: UserRoles.VIEWER
  }
}, {
  tableName: 'project_users',
  timestamps: true
});

// Exportar o modelo e as constantes
module.exports = (sequelize) => {
  const model = ProjectUser(sequelize);
  return {
    ProjectUser: model,
    UserRoles
  };
};
