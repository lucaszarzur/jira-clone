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
    }
  }, {
    tableName: 'projects'
  });

  Project.associate = (models) => {
    Project.hasMany(models.Issue, {
      foreignKey: 'projectId',
      as: 'issues'
    });
  };

  return Project;
};
