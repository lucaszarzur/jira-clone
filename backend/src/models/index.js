const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const config = require('../config/config.js')[process.env.NODE_ENV || 'development'];

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: config.logging
  }
);

const db = {};

// Importar modelos diretamente
const User = require('./user')(sequelize, Sequelize.DataTypes);
const Project = require('./project')(sequelize, Sequelize.DataTypes);
const Issue = require('./issue')(sequelize, Sequelize.DataTypes);
const Comment = require('./comment')(sequelize, Sequelize.DataTypes);
const projectUserModule = require('./projectUser')(sequelize);

// Adicionar modelos ao objeto db
db.User = User;
db.Project = Project;
db.Issue = Issue;
db.Comment = Comment;
db.ProjectUser = projectUserModule.ProjectUser;
db.UserRoles = projectUserModule.UserRoles;

// Definir associações entre modelos
// Projeto e Usuários (muitos para muitos através de ProjectUser)
Project.belongsToMany(User, { through: db.ProjectUser, foreignKey: 'projectId', as: 'users' });
User.belongsToMany(Project, { through: db.ProjectUser, foreignKey: 'userId', as: 'projects' });

// Associações diretas com ProjectUser
db.ProjectUser.belongsTo(User, { foreignKey: 'userId' });
db.ProjectUser.belongsTo(Project, { foreignKey: 'projectId' });
Project.hasMany(db.ProjectUser, { foreignKey: 'projectId' });
User.hasMany(db.ProjectUser, { foreignKey: 'userId' });

// Associa os modelos
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
