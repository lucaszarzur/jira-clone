const { Issue, User, Comment, sequelize } = require('../models');
const { processImagesInContent } = require('../utils/imageProcessor');

// Obter todas as issues
exports.getAllIssues = async (req, res) => {
  try {
    const issues = await Issue.findAll({
      include: [
        {
          model: User,
          as: 'assignees'
        },
        {
          model: User,
          as: 'reporter'
        },
        {
          model: Comment,
          as: 'comments',
          include: [
            {
              model: User,
              as: 'user'
            }
          ]
        }
      ]
    });

    // Converter as issues para o formato esperado pelo frontend
    const responseIssues = issues.map(issue => {
      const issueJson = issue.toJSON();
      return {
        ...issueJson,
        userIds: issue.assignees.map(assignee => assignee.id)
      };
    });

    return res.status(200).json(responseIssues);
  } catch (error) {
    console.error('Erro ao buscar issues:', error);
    return res.status(500).json({ message: 'Erro ao buscar issues', error: error.message });
  }
};

// Obter uma issue pelo ID
exports.getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'assignees'
        },
        {
          model: User,
          as: 'reporter'
        },
        {
          model: Comment,
          as: 'comments',
          include: [
            {
              model: User,
              as: 'user'
            }
          ]
        }
      ]
    });

    if (!issue) {
      return res.status(404).json({ message: 'Issue não encontrada' });
    }

    // Converter a issue para o formato esperado pelo frontend
    const responseIssue = {
      ...issue.toJSON(),
      userIds: issue.assignees.map(assignee => assignee.id)
    };

    return res.status(200).json(responseIssue);
  } catch (error) {
    console.error('Erro ao buscar issue:', error);
    return res.status(500).json({ message: 'Erro ao buscar issue', error: error.message });
  }
};

// Criar uma nova issue
exports.createIssue = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { userIds, ...issueData } = req.body;

    // Processar imagens na descrição, se houver
    if (issueData.description) {
      // Usamos um ID temporário para processar as imagens antes de criar a issue
      const tempId = `temp_${Date.now()}`;
      issueData.description = processImagesInContent(issueData.description, tempId);
    }

    // Obter a última posição da lista para o status
    const lastPosition = await Issue.count({
      where: {
        status: issueData.status,
        projectId: issueData.projectId
      },
      transaction
    });

    // Criar a issue
    const issue = await Issue.create({
      ...issueData,
      listPosition: lastPosition + 1
    }, { transaction });

    // Se usamos um ID temporário, precisamos renomear o diretório de imagens
    if (issueData.description && issueData.description.includes('/uploads/images/temp_')) {
      const fs = require('fs');
      const path = require('path');

      // Extrair o ID temporário da descrição
      const tempIdMatch = issueData.description.match(/\/uploads\/images\/(temp_[0-9]+)\//);
      if (tempIdMatch && tempIdMatch[1]) {
        const tempId = tempIdMatch[1];
        const tempDir = path.join(__dirname, '../../public/uploads/images', tempId);
        const finalDir = path.join(__dirname, '../../public/uploads/images', issue.id);

        // Renomear o diretório se ele existir
        if (fs.existsSync(tempDir)) {
          // Criar o diretório de destino se não existir
          if (!fs.existsSync(finalDir)) {
            fs.mkdirSync(finalDir, { recursive: true });
          }

          // Mover os arquivos
          const files = fs.readdirSync(tempDir);
          files.forEach(file => {
            const oldPath = path.join(tempDir, file);
            const newPath = path.join(finalDir, file);
            fs.renameSync(oldPath, newPath);
          });

          // Remover o diretório temporário
          fs.rmdirSync(tempDir);

          // Atualizar os caminhos das imagens na descrição
          const updatedDescription = issueData.description.replace(
            new RegExp(`/uploads/images/${tempId}`, 'g'),
            `/uploads/images/${issue.id}`
          );

          // Atualizar a descrição da issue com os novos caminhos
          await issue.update({ description: updatedDescription }, { transaction });
        }
      }
    }

    // Associar usuários à issue
    if (userIds && userIds.length > 0) {
      await issue.setAssignees(userIds, { transaction });
    }

    await transaction.commit();

    // Buscar a issue com as associações
    const createdIssue = await Issue.findByPk(issue.id, {
      include: [
        {
          model: User,
          as: 'assignees'
        },
        {
          model: User,
          as: 'reporter'
        },
        {
          model: Comment,
          as: 'comments',
          include: [
            {
              model: User,
              as: 'user'
            }
          ]
        }
      ]
    });

    // Converter a issue para o formato esperado pelo frontend
    const responseIssue = {
      ...createdIssue.toJSON(),
      userIds: createdIssue.assignees.map(assignee => assignee.id)
    };

    return res.status(201).json(responseIssue);
  } catch (error) {
    await transaction.rollback();
    console.error('Erro ao criar issue:', error);
    return res.status(500).json({ message: 'Erro ao criar issue', error: error.message });
  }
};

// Atualizar uma issue
exports.updateIssue = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { userIds, ...issueData } = req.body;

    const issue = await Issue.findByPk(req.params.id, { transaction });
    if (!issue) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Issue não encontrada' });
    }

    // Processar imagens na descrição, se houver
    if (issueData.description) {
      issueData.description = processImagesInContent(issueData.description, issue.id);
    }

    // Atualizar a issue
    await issue.update(issueData, { transaction });

    // Atualizar os usuários associados
    if (userIds) {
      await issue.setAssignees(userIds, { transaction });
    }

    await transaction.commit();

    // Buscar a issue atualizada com as associações
    const updatedIssue = await Issue.findByPk(issue.id, {
      include: [
        {
          model: User,
          as: 'assignees'
        },
        {
          model: User,
          as: 'reporter'
        },
        {
          model: Comment,
          as: 'comments',
          include: [
            {
              model: User,
              as: 'user'
            }
          ]
        }
      ]
    });

    // Converter a issue para o formato esperado pelo frontend
    const responseIssue = {
      ...updatedIssue.toJSON(),
      userIds: updatedIssue.assignees.map(assignee => assignee.id)
    };

    return res.status(200).json(responseIssue);
  } catch (error) {
    await transaction.rollback();
    console.error('Erro ao atualizar issue:', error);
    return res.status(500).json({ message: 'Erro ao atualizar issue', error: error.message });
  }
};

// Excluir uma issue
exports.deleteIssue = async (req, res) => {
  try {
    const issue = await Issue.findByPk(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue não encontrada' });
    }
    await issue.destroy();
    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir issue:', error);
    return res.status(500).json({ message: 'Erro ao excluir issue', error: error.message });
  }
};
