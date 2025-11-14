import express from 'express';
import StudentRepository from '../repositories/StudentRepository.js';
import { protect, authorize } from '../middleware/auth.js';
import { generateVerificationToken, sendVerificationEmail } from '../utils/emailService.js';
import connectSupabase from '../config/supabase.js';

const router = express.Router();

router.use(protect);

// @route   GET /api/students
// @desc    Listar todos os alunos (compartilhado entre todos os usuários)
// @access  Private (Trainer)
router.get('/', authorize('trainer', 'professional'), async (req, res) => {
  try {
    // Buscar todos os alunos (sem filtro por trainer)
    const pool = connectSupabase();
    const result = await pool.query(
      `SELECT id, name, email, is_email_verified, phone, birth_date, gender, 
              join_date, status, service_type, blocked, block_reason, photo, 
              trainer_id, created_at, updated_at 
       FROM students 
       ORDER BY name ASC`
    );
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar alunos',
      error: error.message
    });
  }
});

// @route   GET /api/students/:id
// @desc    Buscar aluno por ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const student = await StudentRepository.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Aluno não encontrado'
      });
    }
    
    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar aluno',
      error: error.message
    });
  }
});

// @route   POST /api/students
// @desc    Criar novo aluno
// @access  Private (Trainer)
router.post('/', authorize('trainer', 'professional'), async (req, res) => {
  try {
    console.log('👤 POST /api/students - Criando aluno');
    console.log('- Dados recebidos:', req.body);
    console.log('- Trainer ID:', req.user.id);
    
    // Remover senha dos dados se foi enviada (será criada pelo aluno)
    const { password, ...studentDataWithoutPassword } = req.body;
    
    const studentData = {
      ...studentDataWithoutPassword,
      trainerId: req.user.id,
      isEmailVerified: false
    };
    
    console.log('- Dados a serem salvos:', studentData);
    
    const student = await StudentRepository.create(studentData);
    
    console.log('✅ Aluno criado com sucesso:', student.id);
    
    // Gerar token de verificação
    const verificationToken = generateVerificationToken();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas
    
    await StudentRepository.setEmailVerificationToken(student.id, verificationToken, expires);
    
    // Enviar email de verificação
    try {
      const emailResult = await sendVerificationEmail(student, verificationToken, req.user.id);
      console.log('📧 Email de verificação enviado para:', student.email);
      
      res.status(201).json({
        success: true,
        message: 'Aluno criado com sucesso! Email de ativação enviado.',
        data: student,
        emailPreviewUrl: emailResult.previewUrl // Apenas para desenvolvimento
      });
    } catch (emailError) {
      console.error('⚠️ Erro ao enviar email, mas aluno foi criado:', emailError);
      
      // Aluno foi criado, mas email falhou
      res.status(201).json({
        success: true,
        message: 'Aluno criado, mas houve erro ao enviar email de ativação',
        data: student,
        emailError: emailError.message
      });
    }
  } catch (error) {
    console.error('❌ Erro ao criar aluno:', error.message);
    console.error('❌ Detalhes completos:', error);
    
    // Verificar se é erro de validação do Mongoose
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: 'Erro de validação',
        errors: errors
      });
    }
    
    // Verificar se é erro de duplicação (email já existe)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email já cadastrado'
      });
    }
    
    res.status(400).json({
      success: false,
      message: 'Erro ao criar aluno',
      error: error.message
    });
  }
});

// @route   PUT /api/students/:id
// @desc    Atualizar aluno
// @access  Private (Trainer)
router.put('/:id', authorize('trainer', 'professional'), async (req, res) => {
  try {
    const student = await StudentRepository.update(req.params.id, req.body);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Aluno não encontrado'
      });
    }
    
    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erro ao atualizar aluno',
      error: error.message
    });
  }
});

// @route   DELETE /api/students/:id
// @desc    Deletar aluno
// @access  Private (Trainer)
router.delete('/:id', authorize('trainer', 'professional'), async (req, res) => {
  try {
    const student = await StudentRepository.delete(req.params.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Aluno não encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Aluno deletado com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar aluno',
      error: error.message
    });
  }
});

// @route   POST /api/students/:id/unblock
// @desc    Desbloquear aluno
// @access  Private (Trainer)
router.post('/:id/unblock', authorize('trainer', 'professional'), async (req, res) => {
  try {
    const student = await StudentRepository.update(req.params.id, {
      blocked: false,
      blockReason: null
    });
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Aluno não encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Aluno desbloqueado com sucesso',
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao desbloquear aluno',
      error: error.message
    });
  }
});

// @route   POST /api/students/:id/block
// @desc    Bloquear aluno manualmente
// @access  Private (Trainer)
router.post('/:id/block', authorize('trainer', 'professional'), async (req, res) => {
  try {
    const student = await StudentRepository.update(req.params.id, {
      blocked: true,
      blockReason: 'manual'
    });
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Aluno não encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Aluno bloqueado com sucesso',
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao bloquear aluno',
      error: error.message
    });
  }
});

// @route   POST /api/students/check-overdue
// @desc    Verificar e bloquear alunos com pagamentos atrasados
// @access  Private (Trainer)
router.post('/check-overdue', authorize('trainer', 'professional'), async (req, res) => {
  try {
    const pool = connectSupabase();
    const today = new Date();
    
    // Buscar pagamentos atrasados
    const overduePayments = await pool.query(
      `SELECT DISTINCT student_id 
       FROM payments 
       WHERE trainer_id = $1 
       AND status IN ('pending', 'overdue') 
       AND due_date < $2`,
      [req.user.id, today]
    );
    
    // Atualizar status dos pagamentos para overdue
    await pool.query(
      `UPDATE payments 
       SET status = 'overdue' 
       WHERE trainer_id = $1 
       AND status = 'pending' 
       AND due_date < $2`,
      [req.user.id, today]
    );
    
    // Buscar IDs únicos de alunos com pagamentos atrasados
    const studentIds = overduePayments.rows.map(p => p.student_id);
    
    if (studentIds.length === 0) {
      return res.json({
        success: true,
        message: 'Nenhum aluno com pagamentos atrasados',
        blockedCount: 0
      });
    }
    
    // Bloquear alunos inadimplentes
    const result = await pool.query(
      `UPDATE students 
       SET blocked = true, block_reason = 'payment_overdue' 
       WHERE id = ANY($1) 
       AND trainer_id = $2 
       AND blocked = false`,
      [studentIds, req.user.id]
    );
    
    res.json({
      success: true,
      message: `${result.rowCount} aluno(s) bloqueado(s) por inadimplência`,
      blockedCount: result.rowCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar inadimplência',
      error: error.message
    });
  }
});

export default router;
