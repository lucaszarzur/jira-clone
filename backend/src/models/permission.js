module.exports = (sequelize, DataTypes) => {
  const Permission = sequelize.define('Permission', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    projectId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'projects',
        key: 'id'
      }
    },
    role: {
      type: DataTypes.ENUM('admin', 'member', 'viewer'),
      allowNull: false,
      defaultValue: 'viewer'
    }
  }, {
    tableName: 'permissions',
    indexes: [
      {
        unique: true,
        fields: ['userId', 'projectId']
      }
    ]
  });

  Permission.associate = (models) => {
    Permission.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });

    Permission.belongsTo(models.Project, {
      foreignKey: 'projectId',
      as: 'project'
    });
  };

  return Permission;
};
