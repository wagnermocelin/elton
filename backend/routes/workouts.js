import express from 'express';
import WorkoutRepository from '../repositories/WorkoutRepository.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.get('/', authorize('trainer', 'professional'), async (req, res) => {
  try {
    // Retorna todos os treinos
    const workouts = await WorkoutRepository.findAll();
    res.json({ success: true, count: workouts.length, data: workouts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', authorize('trainer', 'professional'), async (req, res) => {
  try {
    const workout = await WorkoutRepository.create({ ...req.body, trainerId: req.user.id });
    res.json({ success: true, data: workout });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:id', authorize('trainer', 'professional'), async (req, res) => {
  try {
    const workout = await WorkoutRepository.update(req.params.id, req.body);
    if (!workout) return res.status(404).json({ success: false, message: 'Treino não encontrado' });
    res.json({ success: true, data: workout });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:id', authorize('trainer', 'professional'), async (req, res) => {
  try {
    const workout = await WorkoutRepository.delete(req.params.id);
    if (!workout) return res.status(404).json({ success: false, message: 'Treino não encontrado' });
    res.json({ success: true, message: 'Treino deletado' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
