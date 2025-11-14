import express from 'express';
import ExerciseRepository from '../repositories/ExerciseRepository.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

// @route   GET /api/exercises
// @desc    Listar todos os exercícios (padrão + customizados do trainer)
// @access  Private
router.get('/', async (req, res) => {
  try {
    console.log('💪 GET /api/exercises - Requisição recebida');
    console.log('Query params:', req.query);
    
    const { search, category, muscleGroup, equipment, difficulty, popular } = req.query;
    
    const exercises = await ExerciseRepository.findAll({
      search,
      category,
      muscleGroup,
      equipment,
      difficulty,
      popular,
      trainerId: req.user.id
    });
    
    console.log(`✅ ${exercises.length} exercícios encontrados`);
    
    res.json({ success: true, data: exercises });
  } catch (error) {
    console.error('Erro ao buscar exercícios:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/exercises/:id
// @desc    Buscar exercício por ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const exercise = await ExerciseRepository.findById(req.params.id);
    
    if (!exercise) {
      return res.status(404).json({ success: false, message: 'Exercício não encontrado' });
    }
    
    // Verificar se o exercício é customizado e pertence ao trainer
    if (exercise.is_custom && exercise.trainer_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Acesso negado' });
    }
    
    res.json({ success: true, data: exercise });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/exercises
// @desc    Criar exercício customizado
// @access  Private (Trainer)
router.post('/', async (req, res) => {
  try {
    const exercise = await ExerciseRepository.create({
      ...req.body,
      isCustom: true,
      trainerId: req.user.id
    });
    
    res.status(201).json({ success: true, data: exercise });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/exercises/:id
// @desc    Atualizar exercício customizado
// @access  Private (Trainer)
router.put('/:id', async (req, res) => {
  try {
    const exercise = await ExerciseRepository.findById(req.params.id);
    
    if (!exercise) {
      return res.status(404).json({ success: false, message: 'Exercício não encontrado' });
    }
    
    // Apenas exercícios customizados podem ser editados
    if (!exercise.is_custom) {
      return res.status(403).json({ success: false, message: 'Não é possível editar exercícios padrão' });
    }
    
    // Verificar se pertence ao trainer
    if (exercise.trainer_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Acesso negado' });
    }
    
    const updatedExercise = await ExerciseRepository.update(req.params.id, req.body);
    
    res.json({ success: true, data: updatedExercise });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/exercises/:id
// @desc    Deletar exercício customizado
// @access  Private (Trainer)
router.delete('/:id', async (req, res) => {
  try {
    const exercise = await ExerciseRepository.findById(req.params.id);
    
    if (!exercise) {
      return res.status(404).json({ success: false, message: 'Exercício não encontrado' });
    }
    
    // Apenas exercícios customizados podem ser deletados
    if (!exercise.is_custom) {
      return res.status(403).json({ success: false, message: 'Não é possível deletar exercícios padrão' });
    }
    
    // Verificar se pertence ao trainer
    if (exercise.trainer_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Acesso negado' });
    }
    
    await ExerciseRepository.delete(req.params.id);
    
    res.json({ success: true, message: 'Exercício deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
