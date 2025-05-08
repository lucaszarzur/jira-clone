const { Permission, User, Project } = require('../models');

// Get all permissions for a project
exports.getProjectPermissions = async (req, res) => {
  try {
    const { projectId } = req.params;

    const permissions = await Permission.findAll({
      where: { projectId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'avatarUrl']
        }
      ]
    });

    return res.status(200).json(permissions);
  } catch (error) {
    console.error('Erro ao buscar permissões do projeto:', error);
    return res.status(500).json({ message: 'Erro ao buscar permissões do projeto', error: error.message });
  }
};

// Get user permissions for a project
exports.getUserProjectPermission = async (req, res) => {
  try {
    const { projectId, userId } = req.params;

    const permission = await Permission.findOne({
      where: { projectId, userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'avatarUrl']
        },
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name', 'isPublic']
        }
      ]
    });

    if (!permission) {
      return res.status(404).json({ message: 'Permissão não encontrada' });
    }

    return res.status(200).json(permission);
  } catch (error) {
    console.error('Erro ao buscar permissão do usuário:', error);
    return res.status(500).json({ message: 'Erro ao buscar permissão do usuário', error: error.message });
  }
};

// Add or update user permission for a project
exports.updateUserProjectPermission = async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    const { role } = req.body;

    // Validate role
    const validRoles = ['admin', 'member', 'viewer'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Papel inválido. Deve ser admin, member ou viewer' });
    }

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Check if project exists
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Projeto não encontrado' });
    }

    // Find existing permission or create new one
    const [permission, created] = await Permission.findOrCreate({
      where: { projectId, userId },
      defaults: { role }
    });

    // If permission already exists, update it
    if (!created) {
      await permission.update({ role });
    }

    // Get updated permission with user data
    const updatedPermission = await Permission.findOne({
      where: { projectId, userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'avatarUrl']
        }
      ]
    });

    return res.status(created ? 201 : 200).json(updatedPermission);
  } catch (error) {
    console.error('Erro ao atualizar permissão:', error);
    return res.status(500).json({ message: 'Erro ao atualizar permissão', error: error.message });
  }
};

// Remove user permission from a project
exports.removeUserProjectPermission = async (req, res) => {
  try {
    const { projectId, userId } = req.params;

    // Find permission
    const permission = await Permission.findOne({
      where: { projectId, userId }
    });

    if (!permission) {
      return res.status(404).json({ message: 'Permissão não encontrada' });
    }

    // Delete permission
    await permission.destroy();

    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao remover permissão:', error);
    return res.status(500).json({ message: 'Erro ao remover permissão', error: error.message });
  }
};
