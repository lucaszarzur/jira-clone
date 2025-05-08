const { Project, Issue, User, Permission, sequelize, Sequelize } = require('../models');

// Obter todos os projetos
exports.getAllProjects = async (req, res) => {
  try {
    // Check if user is authenticated
    const userId = req.user ? req.user.id : null;

    let projects;

    if (userId) {
      // If user is authenticated, get all public projects and projects where user has permission
      const userPermissions = await Permission.findAll({
        where: { userId },
        attributes: ['projectId']
      });

      const projectIdsWithPermission = userPermissions.map(p => p.projectId);

      // If there are no project IDs with permission, only get public projects
      if (projectIdsWithPermission.length === 0) {
        projects = await Project.findAll({
          where: { isPublic: true }
        });
      } else {
        // Otherwise, get public projects and projects with permission
        projects = await Project.findAll({
          where: {
            [Sequelize.Op.or]: [
              { isPublic: true },
              { id: { [Sequelize.Op.in]: projectIdsWithPermission } }
            ]
          }
        });
      }

      console.log('User ID:', userId);
      console.log('Project IDs with permission:', projectIdsWithPermission);
      console.log('Projects found:', projects.map(p => p.id));
    } else {
      // If not authenticated, only get public projects
      projects = await Project.findAll({
        where: { isPublic: true }
      });
    }

    return res.status(200).json(projects);
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    return res.status(500).json({ message: 'Erro ao buscar projetos', error: error.message });
  }
};

// Obter um projeto pelo ID com issues e usuários
exports.getProjectById = async (req, res) => {
  try {
    console.log('Buscando projeto pelo ID:', req.params.id);
    console.log('User:', req.user ? req.user.id : 'não autenticado');

    const project = await Project.findByPk(req.params.id, {
      include: [
        {
          model: Issue,
          as: 'issues',
          include: [
            {
              model: User,
              as: 'assignees'
            },
            {
              model: User,
              as: 'reporter'
            }
          ]
        }
      ]
    });

    if (!project) {
      console.error('Projeto não encontrado com ID:', req.params.id);
      return res.status(404).json({ message: 'Projeto não encontrado' });
    }

    // Check if user has permission to access this project
    const userId = req.user ? req.user.id : null;
    let hasPermission = project.isPublic;

    console.log('Project ID:', project.id);
    console.log('Project isPublic:', project.isPublic);
    console.log('User ID:', userId);
    console.log('Initial hasPermission:', hasPermission);

    if (!hasPermission && userId) {
      // Check if user has permission for this project
      const permission = await Permission.findOne({
        where: {
          userId,
          projectId: project.id
        }
      });

      console.log('Permission found:', permission ? permission.id : 'null');
      console.log('User role:', req.user.role);

      hasPermission = !!permission || (req.user.role === 'admin');
      console.log('Final hasPermission:', hasPermission);
    }

    if (!hasPermission) {
      console.log('Access denied');
      return res.status(403).json({ message: 'Você não tem permissão para acessar este projeto' });
    }

    console.log('Projeto encontrado:', project.id);

    // Buscar todos os usuários relacionados ao projeto
    const users = await User.findAll({
      include: [
        {
          model: Issue,
          as: 'assignedIssues',
          where: { projectId: req.params.id },
          required: false
        }
      ]
    });

    console.log(`Encontrados ${users.length} usuários relacionados ao projeto`);

    // Processar as issues para adicionar userIds
    const processedIssues = project.issues.map(issue => {
      const issueJson = issue.toJSON();
      return {
        ...issueJson,
        userIds: issue.assignees.map(assignee => assignee.id)
      };
    });

    console.log(`Processadas ${processedIssues.length} issues com userIds`);

    // Get user permissions for this project if authenticated
    let userPermission = null;
    if (userId) {
      userPermission = await Permission.findOne({
        where: {
          userId,
          projectId: project.id
        }
      });
    }

    // Formatar a resposta para corresponder ao formato esperado pelo frontend
    const formattedProject = {
      ...project.toJSON(),
      issues: processedIssues,
      users,
      userRole: userPermission ? userPermission.role : (project.isPublic ? 'viewer' : null)
    };

    console.log('Resposta formatada enviada ao frontend');

    return res.status(200).json(formattedProject);
  } catch (error) {
    console.error('Erro ao buscar projeto:', error);
    return res.status(500).json({ message: 'Erro ao buscar projeto', error: error.message });
  }
};

// Criar um novo projeto
exports.createProject = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    // Create the project
    const project = await Project.create(req.body, { transaction });

    // Add permission for the creator (admin role)
    await Permission.create({
      userId: req.user.id,
      projectId: project.id,
      role: 'admin'
    }, { transaction });

    await transaction.commit();

    return res.status(201).json(project);
  } catch (error) {
    await transaction.rollback();
    console.error('Erro ao criar projeto:', error);
    return res.status(500).json({ message: 'Erro ao criar projeto', error: error.message });
  }
};

// Atualizar um projeto
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Projeto não encontrado' });
    }

    await project.update(req.body);

    const updatedProject = await Project.findByPk(req.params.id);
    return res.status(200).json(updatedProject);
  } catch (error) {
    console.error('Erro ao atualizar projeto:', error);
    return res.status(500).json({ message: 'Erro ao atualizar projeto', error: error.message });
  }
};

// Excluir um projeto
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Projeto não encontrado' });
    }
    await project.destroy();
    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir projeto:', error);
    return res.status(500).json({ message: 'Erro ao excluir projeto', error: error.message });
  }
};
