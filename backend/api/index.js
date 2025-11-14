// Importar dependências
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Importar rotas
import authRoutes from '../routes/auth.js';
import userRoutes from '../routes/users.js';
import studentRoutes from '../routes/students.js';
import studentAuthRoutes from '../routes/studentAuth.js';
import workoutRoutes from '../routes/workouts.js';
import measurementRoutes from '../routes/measurements.js';
import scheduleRoutes from '../routes/schedules.js';
import dietRoutes from '../routes/diets.js';
import paymentRoutes from '../routes/payments.js';
import configRoutes from '../routes/config.js';
import foodRoutes from '../routes/foods.js';
import exerciseRoutes from '../routes/exercises.js';

const app = express();

// CORS totalmente aberto
app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
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

// Rota raiz
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Power Training',
    version: '1.0.0',
    status: 'online',
    database: 'Supabase (PostgreSQL)'
  });
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erro interno do servidor'
  });
});

export default app;
