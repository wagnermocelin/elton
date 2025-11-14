import express from 'express';
import UserRepository from '../repositories/UserRepository.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Todas as rotas requerem autenticação de trainer
router.use(protect);
router.use(authorize('trainer', 'professional', 'admin'));

// @route   GET /api/users
// @desc    Listar todos os usuários
// @access  Private (Trainer)
router.get('/', async (req, res) => {
  try {
    const users = await UserRepository.findAll();
    
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar usuários',
      error: error.message
    });
  }
});

// @route   POST /api/users
// @desc    Criar novo usuário
// @access  Private (Trainer)
router.post('/', async (req, res) => {
  try {
    const user = await UserRepository.create(req.body);
    
    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
    res.status(400).json({
      success: false,
      message: 'Erro ao criar usuário',
      error: error.message
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Atualizar usuário
// @access  Private (Trainer)
router.put('/:id', async (req, res) => {
  try {
    const user = await UserRepository.update(req.params.id, req.body);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erro ao atualizar usuário',
      error: error.message
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Deletar usuário
// @access  Private (Trainer)
router.delete('/:id', async (req, res) => {
  try {
    const user = await UserRepository.delete(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Usuário deletado com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar usuário',
      error: error.message
    });
  }
});

export default router;
