import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import UserRepository from '../repositories/UserRepository.js';
import StudentRepository from '../repositories/StudentRepository.js';

const router = express.Router();

// Gerar JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @route   POST /api/auth/login
// @desc    Login de usuário (trainer/professional) ou aluno
// @access  Public
router.post('/login', async (req, res) => {
  try {
    console.log('🔐 POST /login - Tentativa de login:', req.body.email);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, forneça email e senha'
      });
    }

    console.log('🔍 Buscando usuário...');
    // Verificar se é um profissional
    let user = await UserRepository.findByEmailWithPassword(email);
    console.log('👤 Usuário encontrado:', !!user);
    
    if (user) {
      if (user.status !== 'active') {
        return res.status(401).json({
          success: false,
          message: 'Usuário inativo'
        });
      }

      const isMatch = await UserRepository.matchPassword(password, user.password);
      
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Credenciais inválidas'
        });
      }

      const token = generateToken(user.id, user.role);

      return res.json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    }

    // Verificar se é um aluno
    user = await StudentRepository.findByEmailWithPassword(email);
    
    if (user) {
      if (user.status !== 'active') {
        return res.status(401).json({
          success: false,
          message: 'Aluno inativo'
        });
      }

      if (user.blocked) {
        const reason = user.block_reason === 'payment_overdue' 
          ? 'Seu acesso foi bloqueado por inadimplência. Entre em contato com seu personal trainer.'
          : 'Seu acesso foi bloqueado. Entre em contato com seu personal trainer.';
        
        return res.status(403).json({
          success: false,
          message: reason,
          blocked: true
        });
      }

      const isMatch = await StudentRepository.matchPassword(password, user.password);
      
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Credenciais inválidas'
        });
      }

      const token = generateToken(user.id, 'student');

      return res.json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: 'student'
        }
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Credenciais inválidas'
    });

  } catch (error) {
    console.error('❌ Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro no servidor',
      error: error.message,
      stack: error.stack
    });
  }
});

// @route   POST /api/auth/register
// @desc    Registrar primeiro usuário admin
// @access  Public (apenas se não houver usuários)
router.post('/register', async (req, res) => {
  try {
    const userCount = await UserRepository.count();
    
    if (userCount > 0) {
      return res.status(403).json({
        success: false,
        message: 'Registro não permitido. Use a área administrativa.'
      });
    }

    const { name, email, password } = req.body;

    const user = await UserRepository.create({
      name,
      email,
      password,
      role: 'trainer',
      status: 'active'
    });

    const token = generateToken(user.id, user.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao criar usuário',
      error: error.message
    });
  }
});

// @route   POST /api/auth/create-first-user
// @desc    Criar primeiro usuário (REMOVER DEPOIS!)
// @access  Public
router.post('/create-first-user', async (req, res) => {
  try {
    console.log('🔧 Tentando criar primeiro usuário...');
    
    const existingUser = await UserRepository.findByEmail('juliana@zem.com');
    if (existingUser) {
      console.log('⚠️ Usuário já existe');
      return res.json({ 
        success: true,
        message: 'Usuário já existe',
        email: 'juliana@zem.com'
      });
    }

    console.log('💾 Criando usuário no banco...');
    // O repository já criptografa a senha automaticamente
    const user = await UserRepository.create({
      name: 'Juliana Dolinski',
      email: 'juliana@zem.com',
      password: '123456', // Será criptografada automaticamente pelo repository
      role: 'professional'
    });

    console.log('✅ Usuário criado:', user.id);
    res.json({ 
      success: true, 
      message: 'Usuário criado com sucesso!',
      email: 'juliana@zem.com',
      senha: '123456',
      role: 'professional',
      id: user.id
    });
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export default router;
