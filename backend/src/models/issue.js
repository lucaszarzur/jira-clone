module.exports = (sequelize, DataTypes) => {
  const Issue = sequelize.define('Issue', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('Story', 'Task', 'Bug'),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('Backlog', 'Selected', 'InProgress', 'Done'),
      allowNull: false
    },
    priority: {
      type: DataTypes.ENUM('Lowest', 'Low', 'Medium', 'High', 'Highest'),
      allowNull: false
    },
    listPosition: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT('medium') // MEDIUMTEXT pode armazenar até 16MB
    },
    estimate: {
      type: DataTypes.INTEGER
    },
    timeSpent: {
      type: DataTypes.INTEGER
    },
    timeRemaining: {
      type: DataTypes.INTEGER
    },
    reporterId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    projectId: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'issues'
  });

  Issue.associate = (models) => {
    Issue.belongsTo(models.User, {
      foreignKey: 'reporterId',
      as: 'reporter'
    });

    Issue.belongsTo(models.Project, {
      foreignKey: 'projectId',
      as: 'project'
    });

    Issue.belongsToMany(models.User, {
      through: {
        model: 'issue_users',
        timestamps: true
      },
      foreignKey: 'issueId',
      otherKey: 'userId',
      as: 'assignees'
    });

    Issue.hasMany(models.Comment, {
      foreignKey: 'issueId',
      as: 'comments'
    });
  };

  return Issue;
};
