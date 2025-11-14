import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectSupabase from './config/supabase.js';

// Importar rotas
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import studentRoutes from './routes/students.js';
import studentAuthRoutes from './routes/studentAuth.js';
import workoutRoutes from './routes/workouts.js';
import measurementRoutes from './routes/measurements.js';
import scheduleRoutes from './routes/schedules.js';
import dietRoutes from './routes/diets.js';
import paymentRoutes from './routes/payments.js';
import configRoutes from './routes/config.js';
import foodRoutes from './routes/foods.js';
import exerciseRoutes from './routes/exercises.js';

// Carregar variáveis de ambiente
dotenv.config();

// Conectar ao banco de dados Supabase (Postgres)
connectSupabase();

const app = express();

// Middleware - CORS configurado para produção e desenvolvimento
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://elton-phi.vercel.app',
  'https://elton.vercel.app',
  process.env.FRONTEND_URL,
  process.env.CORS_ORIGIN
].filter(Boolean);

// TEMPORÁRIO: CORS totalmente aberto até configurar Vercel corretamente
app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/student-auth', studentAuthRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/measurements', measurementRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/diets', dietRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/config', configRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/exercises', exerciseRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Power Training',
    version: '1.0.0',
    status: 'online'
  });
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

// Só iniciar o servidor se não estiver no Vercel (serverless)
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📊 Ambiente: ${process.env.NODE_ENV}`);
    console.log(`🌐 CORS habilitado para: ${process.env.CORS_ORIGIN}`);
  });
}

// Exportar para Vercel serverless
export default app;
