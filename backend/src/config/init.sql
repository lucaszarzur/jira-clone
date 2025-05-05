-- Criação do banco de dados
CREATE DATABASE IF NOT EXISTS jira_clone;
USE jira_clone;

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  avatarUrl VARCHAR(255),
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);

-- Tabela de projetos
CREATE TABLE IF NOT EXISTS projects (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  url VARCHAR(255),
  description TEXT,
  category ENUM('Software', 'Marketing', 'Business') NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);

-- Tabela de issues
CREATE TABLE IF NOT EXISTS issues (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  type ENUM('Story', 'Task', 'Bug') NOT NULL,
  status ENUM('Backlog', 'Selected', 'InProgress', 'Done') NOT NULL,
  priority ENUM('Lowest', 'Low', 'Medium', 'High', 'Highest') NOT NULL,
  listPosition INT NOT NULL,
  description TEXT,
  estimate INT,
  timeSpent INT,
  timeRemaining INT,
  reporterId VARCHAR(36) NOT NULL,
  projectId VARCHAR(36) NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  FOREIGN KEY (reporterId) REFERENCES users(id),
  FOREIGN KEY (projectId) REFERENCES projects(id)
);

-- Tabela de comentários
CREATE TABLE IF NOT EXISTS comments (
  id VARCHAR(36) PRIMARY KEY,
  body TEXT NOT NULL,
  issueId VARCHAR(36) NOT NULL,
  userId VARCHAR(36) NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  FOREIGN KEY (issueId) REFERENCES issues(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id)
);

-- Tabela de relação entre issues e usuários (assignees)
CREATE TABLE IF NOT EXISTS issue_users (
  issueId VARCHAR(36) NOT NULL,
  userId VARCHAR(36) NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (issueId, userId),
  FOREIGN KEY (issueId) REFERENCES issues(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Inserir dados iniciais de usuários
INSERT INTO users (id, name, email, avatarUrl, createdAt, updatedAt)
VALUES
  ('d65047e5-f4cf-4caa-9a38-6073dcbab7d1', 'Lucas Zarzur', 'lucas12zarzur@gmail.com', 'https://media.licdn.com/dms/image/v2/D4E03AQG33wl2LaQxhg/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1723662290547?e=2147483647&v=beta&t=_sMKaiXXDLkggkrmygTpc6LpvQzfFqSh5Ppk00SymDU', NOW(), NOW()),
  ('7ac265f9-b9ac-443f-a2b2-795682e579a4', 'Iron Man', 'ironman@example.com', 'https://res.cloudinary.com/dvujyxh7e/image/upload/c_scale,w_48/v1592405732/ironman_c3jrbc.jpg', NOW(), NOW()),
  ('94502aad-c97f-43e1-a9d1-28cf3e4937a7', 'Captain', 'captain@example.com', 'https://res.cloudinary.com/dvujyxh7e/image/upload/c_scale,w_48/v1592405732/captain_e8s9nk.jpg', NOW(), NOW()),
  ('610451aa-10c8-4d7e-9363-311357c0b0dd', 'Thor', 'thor@example.com', 'https://res.cloudinary.com/dvujyxh7e/image/upload/c_scale,w_48/v1592405731/thor_juqwzf.jpg', NOW(), NOW()),
  ('081ccaa1-5595-4621-8074-ede4927e67b0', 'Spider Man', 'spiderman@example.com', 'https://res.cloudinary.com/dvujyxh7e/image/upload/c_scale,w_48/v1592405731/spiderman_zlrtx0.jpg', NOW(), NOW());

-- Inserir dados iniciais de projetos
INSERT INTO projects (id, name, url, description, category, createdAt, updatedAt)
VALUES
  ('140892', 'TaskFlow Project Management', 'https://github.com/lucaszarzur/jira-clone', 'A modern project management tool built with Angular, Akita and ng-zorro in the frontend and Node.js, Express, MySQL and Sequelize in the backend', 'Software', '2025-05-04 16:00:00', '2020-06-13 16:00:00');

-- Inserir algumas issues iniciais
INSERT INTO issues (id, title, type, status, priority, listPosition, description, reporterId, projectId, createdAt, updatedAt)
VALUES
  ('9584', 'What is Angular Jira clone application?', 'Task', 'Backlog', 'Medium', 2, '<p>There have been a handful of cool Jira-cloned apps written in React/VueJS, which makes me wonder <strong>Why not Angular</strong>? And here you go.</p>', 'd65047e5-f4cf-4caa-9a38-6073dcbab7d1', '140892', '2025-05-04 14:40:00', '2025-05-04 14:51:00'),
  ('9631', 'Each issue has a single reporter but can have multiple assignees.', 'Task', 'Selected', 'Low', 2, '<h2>Try assigning this issue to <strong><u>Spider Man</u></strong>. <span style=\'color: rgb(51, 51, 51);\'>🤣&nbsp;🤣&nbsp;🤣</span></h2>', 'd65047e5-f4cf-4caa-9a38-6073dcbab7d1', '140892', '2025-05-04 14:40:01', '2025-05-04 14:51:09');

-- Inserir relações entre issues e usuários (assignees)
INSERT INTO issue_users (issueId, userId, createdAt, updatedAt)
VALUES
  ('9584', '081ccaa1-5595-4621-8074-ede4927e67b0', NOW(), NOW()),
  ('9584', '610451aa-10c8-4d7e-9363-311357c0b0dd', NOW(), NOW()),
  ('9631', '610451aa-10c8-4d7e-9363-311357c0b0dd', NOW(), NOW()),
  ('9631', '94502aad-c97f-43e1-a9d1-28cf3e4937a7', NOW(), NOW());

-- Inserir alguns comentários
INSERT INTO comments (id, body, issueId, userId, createdAt, updatedAt)
VALUES
  ('1', 'This is a great project!', '9584', '7ac265f9-b9ac-443f-a2b2-795682e579a4', NOW(), NOW()),
  ('2', 'I agree, very useful for learning Angular.', '9584', '94502aad-c97f-43e1-a9d1-28cf3e4937a7', NOW(), NOW());
