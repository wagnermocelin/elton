import express from 'express';
import PaymentRepository from '../repositories/PaymentRepository.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.get('/', async (req, res) => {
  try {
    // Retorna todos os pagamentos com dados do aluno
    const payments = await PaymentRepository.findAll();
    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', authorize('trainer', 'professional'), async (req, res) => {
  try {
    const payment = await PaymentRepository.create({ ...req.body, trainerId: req.user.id });
    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:id', authorize('trainer', 'professional'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar se o ID foi fornecido e não é 'undefined'
    if (!id || id === 'undefined') {
      return res.status(400).json({ 
        success: false, 
        message: 'ID do pagamento inválido ou não fornecido' 
      });
    }
    
    const payment = await PaymentRepository.update(id, req.body);
    
    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Pagamento não encontrado' 
      });
    }
    
    res.json({ success: true, data: payment });
  } catch (error) {
    console.error('❌ Erro ao atualizar pagamento:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:id', authorize('trainer', 'professional'), async (req, res) => {
  try {
    await PaymentRepository.delete(req.params.id);
    res.json({ success: true, message: 'Pagamento deletado' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
