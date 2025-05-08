module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true // Allow null for backward compatibility with existing users
    },
    role: {
      type: DataTypes.ENUM('admin', 'user'),
      defaultValue: 'user',
      allowNull: false
    },
    avatarUrl: {
      type: DataTypes.STRING
    }
  }, {
    tableName: 'users'
  });

  User.associate = (models) => {
    User.hasMany(models.Issue, {
      foreignKey: 'reporterId',
      as: 'reportedIssues'
    });

    User.belongsToMany(models.Issue, {
      through: {
        model: 'issue_users',
        timestamps: true
      },
      foreignKey: 'userId',
      otherKey: 'issueId',
      as: 'assignedIssues'
    });

    User.hasMany(models.Comment, {
      foreignKey: 'userId',
      as: 'comments'
    });

    // New association for project permissions
    if (models.Permission) {
      User.hasMany(models.Permission, {
        foreignKey: 'userId',
        as: 'permissions'
      });
    }
  };

  return User;
};
