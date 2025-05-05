require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'jira_user',
    password: process.env.DB_PASSWORD || 'jira_password',
    database: process.env.DB_NAME || 'jira_clone',
    host: process.env.DB_HOST || 'mysql',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      dateStrings: true,
      typeCast: true
    },
    timezone: '+00:00'
  },
  test: {
    username: process.env.DB_USER || 'jira_user',
    password: process.env.DB_PASSWORD || 'jira_password',
    database: process.env.DB_NAME || 'jira_clone_test',
    host: process.env.DB_HOST || 'mysql',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      dateStrings: true,
      typeCast: true
    },
    timezone: '+00:00'
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      dateStrings: true,
      typeCast: true
    },
    timezone: '+00:00'
  }
};
