const { Comment, User } = require('../models');

// Obter todos os comentários
exports.getAllComments = async (req, res) => {
  try {
    const comments = await Comment.findAll({
      include: [
        {
          model: User,
          as: 'user'
        }
      ]
    });
    return res.status(200).json(comments);
  } catch (error) {
    console.error('Erro ao buscar comentários:', error);
    return res.status(500).json({ message: 'Erro ao buscar comentários', error: error.message });
  }
};

// Obter comentários de uma issue
exports.getCommentsByIssueId = async (req, res) => {
  try {
    const comments = await Comment.findAll({
      where: { issueId: req.params.issueId },
      include: [
        {
          model: User,
          as: 'user'
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    return res.status(200).json(comments);
  } catch (error) {
    console.error('Erro ao buscar comentários da issue:', error);
    return res.status(500).json({ message: 'Erro ao buscar comentários da issue', error: error.message });
  }
};

// Obter um comentário pelo ID
exports.getCommentById = async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user'
        }
      ]
    });

    if (!comment) {
      return res.status(404).json({ message: 'Comentário não encontrado' });
    }

    return res.status(200).json(comment);
  } catch (error) {
    console.error('Erro ao buscar comentário:', error);
    return res.status(500).json({ message: 'Erro ao buscar comentário', error: error.message });
  }
};

// Criar um novo comentário
exports.createComment = async (req, res) => {
  try {
    const comment = await Comment.create(req.body);

    // Buscar o comentário com o usuário associado
    const createdComment = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: 'user'
        }
      ]
    });

    return res.status(201).json(createdComment);
  } catch (error) {
    console.error('Erro ao criar comentário:', error);
    return res.status(500).json({ message: 'Erro ao criar comentário', error: error.message });
  }
};

// Atualizar um comentário
exports.updateComment = async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);

    // Se o comentário não existir, criar um novo
    if (!comment) {
      console.log('Comentário não encontrado, criando um novo');
      // Usar o ID da URL como ID do comentário
      const newComment = await Comment.create({
        ...req.body,
        id: req.params.id
      });

      // Buscar o comentário criado com o usuário associado
      const createdComment = await Comment.findByPk(newComment.id, {
        include: [
          {
            model: User,
            as: 'user'
          }
        ]
      });

      return res.status(201).json(createdComment);
    }

    // Se o comentário existir, atualizar
    await comment.update(req.body);

    // Buscar o comentário atualizado com o usuário associado
    const updatedComment = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: 'user'
        }
      ]
    });

    return res.status(200).json(updatedComment);
  } catch (error) {
    console.error('Erro ao atualizar comentário:', error);
    return res.status(500).json({ message: 'Erro ao atualizar comentário', error: error.message });
  }
};

// Excluir um comentário
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comentário não encontrado' });
    }
    await comment.destroy();
    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir comentário:', error);
    return res.status(500).json({ message: 'Erro ao excluir comentário', error: error.message });
  }
};
