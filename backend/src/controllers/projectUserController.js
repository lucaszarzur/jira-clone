const { User, Project, ProjectUser, UserRoles } = require('../models');
const { Op } = require('sequelize');

// Verificar se o usuário tem permissão para gerenciar usuários do projeto
const checkAdminPermission = async (userId, projectId) => {
  // Verificar se o usuário é administrador do projeto
  const projectUser = await ProjectUser.findOne({
    where: {
      userId,
      projectId,
      role: UserRoles.ADMIN
    }
  });

  return !!projectUser;
};

// Listar todos os usuários de um projeto
exports.getProjectUsers = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.id;

    // Verificar se o projeto existe
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Projeto não encontrado' });
    }

    // Verificar se o usuário tem acesso ao projeto
    const hasAccess = project.isPublic || userId && (
      await ProjectUser.findOne({ where: { projectId, userId } })
    );

    if (!hasAccess) {
      return res.status(403).json({ message: 'Acesso negado a este projeto' });
    }

    // Buscar usuários do projeto com suas funções
    const projectUsers = await ProjectUser.findAll({
      where: { projectId },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'avatarUrl']
        }
      ]
    });

    return res.status(200).json(projectUsers);
  } catch (error) {
    console.error('Erro ao listar usuários do projeto:', error);
    return res.status(500).json({ message: 'Erro ao listar usuários do projeto' });
  }
};

// Adicionar um usuário ao projeto
exports.addUserToProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId, role } = req.body;
    const requestingUserId = req.user?.id;

    if (!requestingUserId) {
      return res.status(401).json({ message: 'Autenticação necessária' });
    }

    // Verificar se o projeto existe
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Projeto não encontrado' });
    }

    // Verificar se o usuário solicitante tem permissão de administrador
    const isAdmin = await checkAdminPermission(requestingUserId, projectId);
    if (!isAdmin) {
      return res.status(403).json({ message: 'Apenas administradores podem adicionar usuários ao projeto' });
    }

    // Verificar se o usuário a ser adicionado existe
    const userToAdd = await User.findByPk(userId);
    if (!userToAdd) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Verificar se o usuário já está no projeto
    const existingProjectUser = await ProjectUser.findOne({
      where: { projectId, userId }
    });

    if (existingProjectUser) {
      return res.status(400).json({ message: 'Usuário já está no projeto' });
    }

    // Validar a função
    if (!Object.values(UserRoles).includes(role)) {
      return res.status(400).json({ 
        message: 'Função inválida',
        validRoles: Object.values(UserRoles)
      });
    }

    // Adicionar o usuário ao projeto
    const projectUser = await ProjectUser.create({
      projectId,
      userId,
      role
    });

    return res.status(201).json(projectUser);
  } catch (error) {
    console.error('Erro ao adicionar usuário ao projeto:', error);
    return res.status(500).json({ message: 'Erro ao adicionar usuário ao projeto' });
  }
};

// Atualizar a função de um usuário em um projeto
exports.updateUserRole = async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    const { role } = req.body;
    const requestingUserId = req.user?.id;

    if (!requestingUserId) {
      return res.status(401).json({ message: 'Autenticação necessária' });
    }

    // Verificar se o projeto existe
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Projeto não encontrado' });
    }

    // Verificar se o usuário solicitante tem permissão de administrador
    const isAdmin = await checkAdminPermission(requestingUserId, projectId);
    if (!isAdmin) {
      return res.status(403).json({ message: 'Apenas administradores podem atualizar funções de usuários' });
    }

    // Verificar se o usuário está no projeto
    const projectUser = await ProjectUser.findOne({
      where: { projectId, userId }
    });

    if (!projectUser) {
      return res.status(404).json({ message: 'Usuário não encontrado no projeto' });
    }

    // Validar a função
    if (!Object.values(UserRoles).includes(role)) {
      return res.status(400).json({ 
        message: 'Função inválida',
        validRoles: Object.values(UserRoles)
      });
    }

    // Não permitir que o último administrador seja rebaixado
    if (projectUser.role === UserRoles.ADMIN && role !== UserRoles.ADMIN) {
      // Contar quantos administradores existem no projeto
      const adminCount = await ProjectUser.count({
        where: {
          projectId,
          role: UserRoles.ADMIN
        }
      });

      if (adminCount <= 1) {
        return res.status(400).json({ 
          message: 'Não é possível rebaixar o último administrador do projeto' 
        });
      }
    }

    // Atualizar a função do usuário
    projectUser.role = role;
    await projectUser.save();

    return res.status(200).json(projectUser);
  } catch (error) {
    console.error('Erro ao atualizar função do usuário:', error);
    return res.status(500).json({ message: 'Erro ao atualizar função do usuário' });
  }
};

// Remover um usuário de um projeto
exports.removeUserFromProject = async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    const requestingUserId = req.user?.id;

    if (!requestingUserId) {
      return res.status(401).json({ message: 'Autenticação necessária' });
    }

    // Verificar se o projeto existe
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Projeto não encontrado' });
    }

    // Verificar se o usuário solicitante tem permissão de administrador
    const isAdmin = await checkAdminPermission(requestingUserId, projectId);
    if (!isAdmin) {
      return res.status(403).json({ message: 'Apenas administradores podem remover usuários do projeto' });
    }

    // Verificar se o usuário está no projeto
    const projectUser = await ProjectUser.findOne({
      where: { projectId, userId }
    });

    if (!projectUser) {
      return res.status(404).json({ message: 'Usuário não encontrado no projeto' });
    }

    // Não permitir que o último administrador seja removido
    if (projectUser.role === UserRoles.ADMIN) {
      // Contar quantos administradores existem no projeto
      const adminCount = await ProjectUser.count({
        where: {
          projectId,
          role: UserRoles.ADMIN
        }
      });

      if (adminCount <= 1) {
        return res.status(400).json({ 
          message: 'Não é possível remover o último administrador do projeto' 
        });
      }
    }

    // Remover o usuário do projeto
    await projectUser.destroy();

    return res.status(200).json({ message: 'Usuário removido do projeto com sucesso' });
  } catch (error) {
    console.error('Erro ao remover usuário do projeto:', error);
    return res.status(500).json({ message: 'Erro ao remover usuário do projeto' });
  }
};

// Listar usuários disponíveis para adicionar ao projeto
exports.getAvailableUsers = async (req, res) => {
  try {
    const { projectId } = req.params;
    const requestingUserId = req.user?.id;

    if (!requestingUserId) {
      return res.status(401).json({ message: 'Autenticação necessária' });
    }

    // Verificar se o projeto existe
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Projeto não encontrado' });
    }

    // Verificar se o usuário solicitante tem permissão de administrador
    const isAdmin = await checkAdminPermission(requestingUserId, projectId);
    if (!isAdmin) {
      return res.status(403).json({ message: 'Apenas administradores podem ver usuários disponíveis' });
    }

    // Buscar IDs de usuários já no projeto
    const projectUserIds = await ProjectUser.findAll({
      where: { projectId },
      attributes: ['userId']
    }).then(users => users.map(u => u.userId));

    // Buscar usuários que não estão no projeto
    const availableUsers = await User.findAll({
      where: {
        id: {
          [Op.notIn]: projectUserIds
        }
      },
      attributes: ['id', 'name', 'email', 'avatarUrl']
    });

    return res.status(200).json(availableUsers);
  } catch (error) {
    console.error('Erro ao listar usuários disponíveis:', error);
    return res.status(500).json({ message: 'Erro ao listar usuários disponíveis' });
  }
};
