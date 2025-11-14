import express from 'express';
import FoodRepository from '../repositories/FoodRepository.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

// @route   GET /api/foods
// @desc    Listar todos os alimentos (padrão + customizados do trainer)
// @access  Private
router.get('/', async (req, res) => {
  try {
    console.log('🍽️ GET /api/foods - Requisição recebida');
    console.log('Query params:', req.query);
    console.log('User ID:', req.user.id);
    
    const { search, category, popular } = req.query;
    
    const foods = await FoodRepository.findAll({
      search,
      category,
      popular,
      trainerId: req.user.id
    });
    
    console.log(`✅ ${foods.length} alimentos encontrados`);
    
    res.json({ success: true, data: foods });
  } catch (error) {
    console.error('Erro ao buscar alimentos:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/foods/:id
// @desc    Buscar alimento por ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const food = await FoodRepository.findById(req.params.id);
    
    if (!food) {
      return res.status(404).json({ success: false, message: 'Alimento não encontrado' });
    }
    
    // Verificar se o alimento é customizado e pertence ao trainer
    if (food.is_custom && food.trainer_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Acesso negado' });
    }
    
    res.json({ success: true, data: food });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/foods
// @desc    Criar alimento customizado
// @access  Private (Trainer)
router.post('/', async (req, res) => {
  try {
    const food = await FoodRepository.create({
      ...req.body,
      isCustom: true,
      trainerId: req.user.id,
      source: 'Manual'
    });
    
    res.status(201).json({ success: true, data: food });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/foods/:id
// @desc    Atualizar alimento customizado
// @access  Private (Trainer)
router.put('/:id', async (req, res) => {
  try {
    const food = await FoodRepository.findById(req.params.id);
    
    if (!food) {
      return res.status(404).json({ success: false, message: 'Alimento não encontrado' });
    }
    
    // Apenas alimentos customizados podem ser editados
    if (!food.is_custom) {
      return res.status(403).json({ success: false, message: 'Não é possível editar alimentos padrão' });
    }
    
    // Verificar se pertence ao trainer
    if (food.trainer_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Acesso negado' });
    }
    
    const updatedFood = await FoodRepository.update(req.params.id, req.body);
    
    res.json({ success: true, data: updatedFood });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/foods/:id
// @desc    Deletar alimento customizado
// @access  Private (Trainer)
router.delete('/:id', async (req, res) => {
  try {
    const food = await FoodRepository.findById(req.params.id);
    
    if (!food) {
      return res.status(404).json({ success: false, message: 'Alimento não encontrado' });
    }
    
    // Apenas alimentos customizados podem ser deletados
    if (!food.is_custom) {
      return res.status(403).json({ success: false, message: 'Não é possível deletar alimentos padrão' });
    }
    
    // Verificar se pertence ao trainer
    if (food.trainer_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Acesso negado' });
    }
    
    await FoodRepository.delete(req.params.id);
    
    res.json({ success: true, message: 'Alimento deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/foods/categories/list
// @desc    Listar categorias disponíveis
// @access  Private
router.get('/categories/list', async (req, res) => {
  try {
    const categories = [
      { value: 'proteina', label: 'Proteína', icon: '🥩' },
      { value: 'carboidrato', label: 'Carboidrato', icon: '🍞' },
      { value: 'vegetal', label: 'Vegetal', icon: '🥬' },
      { value: 'fruta', label: 'Fruta', icon: '🍎' },
      { value: 'gordura', label: 'Gordura', icon: '🥑' },
      { value: 'lacteo', label: 'Laticínio', icon: '🥛' },
      { value: 'bebida', label: 'Bebida', icon: '🥤' },
      { value: 'outro', label: 'Outro', icon: '🍽️' }
    ];
    
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/foods/:id/calculate
// @desc    Calcular macros para quantidade específica
// @access  Private
router.post('/:id/calculate', async (req, res) => {
  try {
    const { amount, unit } = req.body;
    
    const food = await FoodRepository.findById(req.params.id);
    
    if (!food) {
      return res.status(404).json({ success: false, message: 'Alimento não encontrado' });
    }
    
    const macros = FoodRepository.calculateMacros(food, amount, unit);
    
    res.json({ 
      success: true, 
      data: {
        food: food.name,
        amount,
        unit,
        macros
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
