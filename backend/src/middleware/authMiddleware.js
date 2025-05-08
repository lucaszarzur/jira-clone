// const jwt = require('jsonwebtoken'); // Temporarily commented out
const { User } = require('../models');

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify token (simplified for now)
exports.authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    // Simple token verification (temporary, not secure)
    // Extract user ID from token format: fake-token-USER_ID-TIMESTAMP
    if (!token.startsWith('fake-token-')) {
      return res.status(403).json({ message: 'Token inválido ou expirado' });
    }

    // Extract the user ID from the token
    // The token format is: fake-token-USER_ID-TIMESTAMP
    // The USER_ID can contain hyphens, so we need to extract it carefully
    const tokenWithoutPrefix = token.substring('fake-token-'.length);
    const lastHyphenIndex = tokenWithoutPrefix.lastIndexOf('-');
    const userId = tokenWithoutPrefix.substring(0, lastHyphenIndex);
    console.log('Extracted userId:', userId);

    // Find the user
    const user = await User.findByPk(userId);
    console.log('Found user:', user ? user.id : 'null');
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return res.status(500).json({ message: 'Erro na autenticação', error: error.message });
  }
};

// Middleware to check if user is admin
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Acesso negado. Requer privilégios de administrador.' });
  }
};

// Middleware to optionally authenticate token
exports.optionalAuthenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      // If no token, continue without authentication
      console.log('No token provided, continuing as unauthenticated');
      return next();
    }

    // Simple token verification (temporary, not secure)
    // Extract user ID from token format: fake-token-USER_ID-TIMESTAMP
    if (!token.startsWith('fake-token-')) {
      console.log('Invalid token format');
      // If invalid token, continue without authentication
      return next();
    }

    // Extract the user ID from the token
    // The token format is: fake-token-USER_ID-TIMESTAMP
    // The USER_ID can contain hyphens, so we need to extract it carefully
    const tokenWithoutPrefix = token.substring('fake-token-'.length);
    const lastHyphenIndex = tokenWithoutPrefix.lastIndexOf('-');
    const userId = tokenWithoutPrefix.substring(0, lastHyphenIndex);
    console.log('Extracted userId (optional):', userId);

    // Find the user
    const user = await User.findByPk(userId);
    console.log('Found user (optional):', user ? user.id : 'null');

    if (user) {
      // Attach user to request
      req.user = user;
    }

    next();
  } catch (error) {
    console.error('Erro na autenticação opcional:', error);
    // Continue without authentication in case of error
    next();
  }
};

// Middleware to check project permissions
exports.checkProjectPermission = (requiredRole = 'viewer') => {
  return async (req, res, next) => {
    try {
      const { projectId } = req.params;
      const userId = req.user.id;

      // If user is admin, allow access
      if (req.user.role === 'admin') {
        return next();
      }

      // Check if project is public
      const { Project, Permission } = require('../models');
      const project = await Project.findByPk(projectId);

      if (!project) {
        return res.status(404).json({ message: 'Projeto não encontrado' });
      }

      // If project is public, allow access for viewing
      if (project.isPublic && requiredRole === 'viewer') {
        return next();
      }

      // Check user's permission for this project
      const permission = await Permission.findOne({
        where: {
          userId,
          projectId
        }
      });

      if (!permission) {
        return res.status(403).json({ message: 'Você não tem permissão para acessar este projeto' });
      }

      // Check if user has required role or higher
      const roles = ['viewer', 'member', 'admin'];
      const userRoleIndex = roles.indexOf(permission.role);
      const requiredRoleIndex = roles.indexOf(requiredRole);

      if (userRoleIndex >= requiredRoleIndex) {
        return next();
      }

      return res.status(403).json({ message: `Acesso negado. Requer permissão de ${requiredRole} ou superior.` });
    } catch (error) {
      console.error('Erro ao verificar permissão:', error);
      return res.status(500).json({ message: 'Erro ao verificar permissão', error: error.message });
    }
  };
};
