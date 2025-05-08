module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define('Project', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    url: {
      type: DataTypes.STRING
    },
    description: {
      type: DataTypes.TEXT
    },
    category: {
      type: DataTypes.ENUM('Software', 'Marketing', 'Business'),
      allowNull: false
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    tableName: 'projects'
  });

  Project.associate = (models) => {
    Project.hasMany(models.Issue, {
      foreignKey: 'projectId',
      as: 'issues'
    });

    // New association for project permissions
    if (models.Permission) {
      Project.hasMany(models.Permission, {
        foreignKey: 'projectId',
        as: 'permissions'
      });
    }
  };

  return Project;
};
