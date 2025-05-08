const { Project, ProjectUser, UserRoles } = require('../models');
const { Op } = require('sequelize');

// Middleware para verificar se o usuário tem permissão para acessar um projeto
exports.checkProjectAccess = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.id;

    // Se não há usuário autenticado, verificar se o projeto é público
    if (!userId) {
      const project = await Project.findByPk(projectId);
      if (!project || !project.isPublic) {
        return res.status(401).json({ message: 'Autenticação necessária para acessar este projeto' });
      }
      // Projeto é público, permitir acesso
      return next();
    }

    // Verificar se o projeto existe
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Projeto não encontrado' });
    }

    // Se o projeto é público, permitir acesso
    if (project.isPublic) {
      return next();
    }

    // Verificar se o usuário tem acesso ao projeto
    const projectUser = await ProjectUser.findOne({
      where: { projectId, userId }
    });

    if (!projectUser) {
      return res.status(403).json({ message: 'Você não tem permissão para acessar este projeto' });
    }

    // Adicionar informações de permissão ao objeto de requisição
    req.projectRole = projectUser.role;

    next();
  } catch (error) {
    console.error('Erro ao verificar permissão de projeto:', error);
    return res.status(500).json({ message: 'Erro ao verificar permissão' });
  }
};

// Middleware para verificar se o usuário tem permissão de administrador em um projeto
exports.checkAdminPermission = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Autenticação necessária' });
    }

    // Verificar se o projeto existe
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Projeto não encontrado' });
    }

    // Verificar se o usuário é administrador do projeto
    const projectUser = await ProjectUser.findOne({
      where: {
        projectId,
        userId,
        role: UserRoles.ADMIN
      }
    });

    if (!projectUser) {
      return res.status(403).json({ message: 'Apenas administradores podem realizar esta ação' });
    }

    next();
  } catch (error) {
    console.error('Erro ao verificar permissão de administrador:', error);
    return res.status(500).json({ message: 'Erro ao verificar permissão' });
  }
};

// Middleware para verificar se o usuário tem permissão de membro ou superior em um projeto
exports.checkMemberPermission = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Autenticação necessária' });
    }

    // Verificar se o projeto existe
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Projeto não encontrado' });
    }

    // Verificar se o usuário é membro ou administrador do projeto
    const projectUser = await ProjectUser.findOne({
      where: {
        projectId,
        userId,
        role: {
          [Op.in]: [UserRoles.ADMIN, UserRoles.MEMBER]
        }
      }
    });

    if (!projectUser) {
      return res.status(403).json({ message: 'Você precisa ser membro ou administrador para realizar esta ação' });
    }

    next();
  } catch (error) {
    console.error('Erro ao verificar permissão de membro:', error);
    return res.status(500).json({ message: 'Erro ao verificar permissão' });
  }
};
