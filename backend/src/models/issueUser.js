module.exports = (sequelize, DataTypes) => {
  const IssueUser = sequelize.define('IssueUser', {
    issueId: {
      type: DataTypes.STRING,
      primaryKey: true,
      references: {
        model: 'issues',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.STRING,
      primaryKey: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'issue_users',
    timestamps: true
  });

  return IssueUser;
};
