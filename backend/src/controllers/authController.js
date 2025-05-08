const { User } = require('../models');
// const bcrypt = require('bcrypt'); // Temporarily commented out
// const jwt = require('jsonwebtoken'); // Temporarily commented out

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '24h';

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Check if user has a password (for backward compatibility)
    if (!user.password) {
      return res.status(401).json({ message: 'Usuário precisa redefinir a senha' });
    }

    // Simple password check (temporary, not secure)
    const isPasswordValid = password === 'password'; // All users have the same password for now
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Generate fake token (temporary, not secure)
    const token = `fake-token-${user.id}-${Date.now()}`;

    // Return user data and token
    return res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      token
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ message: 'Erro no login', error: error.message });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nome, email e senha são obrigatórios' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email já está em uso' });
    }

    // Hash password (temporary, not secure)
    const hashedPassword = password; // Store password in plain text for now

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'user' // Default role
    });

    // Generate fake token (temporary, not secure)
    const token = `fake-token-${user.id}-${Date.now()}`;

    // Return user data and token
    return res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      token
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    return res.status(500).json({ message: 'Erro no registro', error: error.message });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = req.user;
    return res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl
    });
  } catch (error) {
    console.error('Erro ao obter usuário atual:', error);
    return res.status(500).json({ message: 'Erro ao obter usuário atual', error: error.message });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Senha atual e nova senha são obrigatórias' });
    }

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Check current password (temporary, not secure)
    const isPasswordValid = currentPassword === 'password'; // All users have the same password for now
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Senha atual incorreta' });
    }

    // Hash new password (temporary, not secure)
    const hashedPassword = newPassword; // Store password in plain text for now

    // Update password
    await user.update({ password: hashedPassword });

    return res.status(200).json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    return res.status(500).json({ message: 'Erro ao alterar senha', error: error.message });
  }
};
