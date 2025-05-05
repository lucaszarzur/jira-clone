module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    issueId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'comments'
  });

  Comment.associate = (models) => {
    Comment.belongsTo(models.Issue, {
      foreignKey: 'issueId',
      as: 'issue'
    });

    Comment.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return Comment;
};
