const { Project, Issue, User } = require('../models');

// Obter todos os projetos
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.findAll();
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

    // Formatar a resposta para corresponder ao formato esperado pelo frontend
    const formattedProject = {
      ...project.toJSON(),
      issues: processedIssues,
      users
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
  try {
    const project = await Project.create(req.body);
    return res.status(201).json(project);
  } catch (error) {
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
