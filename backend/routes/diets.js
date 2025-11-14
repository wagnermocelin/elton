import express from 'express';
import DietRepository from '../repositories/DietRepository.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.get('/', async (req, res) => {
  try {
    // Retorna todas as dietas com dados do student
    const diets = await DietRepository.findAll();
    res.json({ success: true, data: diets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', authorize('trainer', 'professional'), async (req, res) => {
  try {
    // O repository já calcula os totais automaticamente
    const diet = await DietRepository.create({ ...req.body, trainerId: req.user.id });
    
    res.status(201).json({ success: true, data: diet });
  } catch (error) {
    console.error('Erro ao criar dieta:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:id', authorize('trainer', 'professional'), async (req, res) => {
  try {
    // O repository já calcula os totais automaticamente
    const diet = await DietRepository.update(req.params.id, req.body);
    
    res.json({ success: true, data: diet });
  } catch (error) {
    console.error('Erro ao atualizar dieta:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:id', authorize('trainer', 'professional'), async (req, res) => {
  try {
    await DietRepository.delete(req.params.id);
    res.json({ success: true, message: 'Dieta deletada' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
