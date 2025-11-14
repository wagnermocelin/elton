import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectSupabase from '../config/supabase.js';

// Carregar variáveis de ambiente
dotenv.config();

// Importar models do MongoDB
import User from '../models/User.js';
import Student from '../models/Student.js';
import Exercise from '../models/Exercise.js';
import Food from '../models/Food.js';
import Workout from '../models/Workout.js';
import Diet from '../models/Diet.js';
import Measurement from '../models/Measurement.js';
import Schedule from '../models/Schedule.js';
import Payment from '../models/Payment.js';
import Config from '../models/Config.js';

// Conectar ao MongoDB
const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error);
    process.exit(1);
  }
};

// Migrar Users
const migrateUsers = async (pool) => {
  console.log('\n👤 Migrando Users...');
  const users = await User.find({});
  console.log(`📊 Total de users no MongoDB: ${users.length}`);

  let migrated = 0;
  for (const user of users) {
    try {
      await pool.query(
        `INSERT INTO users (name, email, password, role, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (email) DO NOTHING`,
        [user.name, user.email, user.password, user.role, user.status, user.createdAt, user.updatedAt]
      );
      migrated++;
    } catch (error) {
      console.error(`❌ Erro ao migrar user ${user.email}:`, error.message);
    }
  }
  console.log(`✅ Users migrados: ${migrated}/${users.length}`);
};

// Migrar Students
const migrateStudents = async (pool) => {
  console.log('\n🎓 Migrando Students...');
  const students = await Student.find({});
  console.log(`📊 Total de students no MongoDB: ${students.length}`);

  let migrated = 0;
  for (const student of students) {
    try {
      // Buscar trainer_id pelo email do trainer
      const trainerResult = await pool.query(
        'SELECT id FROM users WHERE email = (SELECT email FROM users WHERE _id = $1 LIMIT 1)',
        [student.trainer?.toString()]
      );

      // Se não encontrar trainer, pular
      if (!trainerResult.rows[0]) {
        console.log(`⚠️ Trainer não encontrado para student ${student.email}, pulando...`);
        continue;
      }

      const trainerId = trainerResult.rows[0].id;

      await pool.query(
        `INSERT INTO students 
         (name, email, password, is_email_verified, email_verification_token, email_verification_expires,
          password_reset_token, password_reset_expires, phone, birth_date, gender, join_date, status,
          service_type, blocked, block_reason, photo, trainer_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
         ON CONFLICT (email) DO NOTHING`,
        [
          student.name, student.email, student.password, student.isEmailVerified,
          student.emailVerificationToken, student.emailVerificationExpires,
          student.passwordResetToken, student.passwordResetExpires,
          student.phone, student.birthDate, student.gender, student.joinDate,
          student.status, student.serviceType, student.blocked, student.blockReason,
          student.photo, trainerId, student.createdAt, student.updatedAt
        ]
      );
      migrated++;
    } catch (error) {
      console.error(`❌ Erro ao migrar student ${student.email}:`, error.message);
    }
  }
  console.log(`✅ Students migrados: ${migrated}/${students.length}`);
};

// Migrar Exercises
const migrateExercises = async (pool) => {
  console.log('\n💪 Migrando Exercises...');
  const exercises = await Exercise.find({});
  console.log(`📊 Total de exercises no MongoDB: ${exercises.length}`);

  let migrated = 0;
  for (const exercise of exercises) {
    try {
      let trainerId = null;
      if (exercise.trainer) {
        const trainerResult = await pool.query(
          'SELECT id FROM users LIMIT 1'
        );
        trainerId = trainerResult.rows[0]?.id;
      }

      await pool.query(
        `INSERT INTO exercises 
         (name, category, muscle_group, equipment, difficulty, description, instructions,
          video_url, is_custom, trainer_id, tags, popular, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         ON CONFLICT DO NOTHING`,
        [
          exercise.name, exercise.category, exercise.muscleGroup, exercise.equipment,
          exercise.difficulty, exercise.description, exercise.instructions,
          exercise.videoUrl, exercise.isCustom, trainerId, exercise.tags || [],
          exercise.popular, exercise.createdAt, exercise.updatedAt
        ]
      );
      migrated++;
    } catch (error) {
      console.error(`❌ Erro ao migrar exercise ${exercise.name}:`, error.message);
    }
  }
  console.log(`✅ Exercises migrados: ${migrated}/${exercises.length}`);
};

// Migrar Foods
const migrateFoods = async (pool) => {
  console.log('\n🍽️ Migrando Foods...');
  const foods = await Food.find({});
  console.log(`📊 Total de foods no MongoDB: ${foods.length}`);

  let migrated = 0;
  for (const food of foods) {
    try {
      let trainerId = null;
      if (food.trainer) {
        const trainerResult = await pool.query(
          'SELECT id FROM users LIMIT 1'
        );
        trainerId = trainerResult.rows[0]?.id;
      }

      await pool.query(
        `INSERT INTO foods 
         (name, category, serving_amount, serving_unit, calories, protein, carbs, fat,
          fiber, sodium, is_custom, trainer_id, source, tags, popular, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
         ON CONFLICT DO NOTHING`,
        [
          food.name, food.category, food.servingAmount, food.servingUnit,
          food.calories, food.protein, food.carbs, food.fat, food.fiber,
          food.sodium, food.isCustom, trainerId, food.source, food.tags || [],
          food.popular, food.createdAt, food.updatedAt
        ]
      );
      migrated++;
    } catch (error) {
      console.error(`❌ Erro ao migrar food ${food.name}:`, error.message);
    }
  }
  console.log(`✅ Foods migrados: ${migrated}/${foods.length}`);
};

// Migrar Workouts
const migrateWorkouts = async (pool) => {
  console.log('\n🏋️ Migrando Workouts...');
  const workouts = await Workout.find({});
  console.log(`📊 Total de workouts no MongoDB: ${workouts.length}`);

  let migrated = 0;
  for (const workout of workouts) {
    try {
      const trainerResult = await pool.query('SELECT id FROM users LIMIT 1');
      const trainerId = trainerResult.rows[0]?.id;

      await pool.query(
        `INSERT INTO workouts (name, description, exercises, trainer_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          workout.name, workout.description, JSON.stringify(workout.exercises),
          trainerId, workout.createdAt, workout.updatedAt
        ]
      );
      migrated++;
    } catch (error) {
      console.error(`❌ Erro ao migrar workout ${workout.name}:`, error.message);
    }
  }
  console.log(`✅ Workouts migrados: ${migrated}/${workouts.length}`);
};

// Migrar Diets
const migrateDiets = async (pool) => {
  console.log('\n🥗 Migrando Diets...');
  const diets = await Diet.find({});
  console.log(`📊 Total de diets no MongoDB: ${diets.length}`);

  let migrated = 0;
  for (const diet of diets) {
    try {
      const studentResult = await pool.query(
        'SELECT id FROM students WHERE email = (SELECT email FROM students LIMIT 1)'
      );
      const studentId = studentResult.rows[0]?.id;

      const trainerResult = await pool.query('SELECT id FROM users LIMIT 1');
      const trainerId = trainerResult.rows[0]?.id;

      if (!studentId) continue;

      await pool.query(
        `INSERT INTO diets (student_id, name, goals, totals, meals, notes, status, trainer_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          studentId, diet.name, JSON.stringify(diet.goals), JSON.stringify(diet.totals),
          JSON.stringify(diet.meals), diet.notes, diet.status, trainerId,
          diet.createdAt, diet.updatedAt
        ]
      );
      migrated++;
    } catch (error) {
      console.error(`❌ Erro ao migrar diet ${diet.name}:`, error.message);
    }
  }
  console.log(`✅ Diets migrados: ${migrated}/${diets.length}`);
};

// Migrar Payments
const migratePayments = async (pool) => {
  console.log('\n💰 Migrando Payments...');
  const payments = await Payment.find({});
  console.log(`📊 Total de payments no MongoDB: ${payments.length}`);

  let migrated = 0;
  for (const payment of payments) {
    try {
      const studentResult = await pool.query('SELECT id FROM students LIMIT 1');
      const studentId = studentResult.rows[0]?.id;

      const trainerResult = await pool.query('SELECT id FROM users LIMIT 1');
      const trainerId = trainerResult.rows[0]?.id;

      if (!studentId) continue;

      await pool.query(
        `INSERT INTO payments (student_id, month, year, amount, due_date, payment_date, status, payment_method, notes, trainer_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          studentId, payment.month, payment.year, payment.amount,
          payment.dueDate, payment.paymentDate, payment.status,
          payment.paymentMethod, payment.notes, trainerId,
          payment.createdAt, payment.updatedAt
        ]
      );
      migrated++;
    } catch (error) {
      console.error(`❌ Erro ao migrar payment:`, error.message);
    }
  }
  console.log(`✅ Payments migrados: ${migrated}/${payments.length}`);
};

// Função principal
const migrateData = async () => {
  console.log('🚀 Iniciando migração de dados MongoDB → Supabase\n');

  try {
    // Conectar aos bancos
    await connectMongoDB();
    const pool = connectSupabase();

    // Migrar dados na ordem correta (respeitando foreign keys)
    await migrateUsers(pool);
    await migrateStudents(pool);
    await migrateExercises(pool);
    await migrateFoods(pool);
    await migrateWorkouts(pool);
    await migrateDiets(pool);
    await migratePayments(pool);

    console.log('\n✅ Migração concluída com sucesso!');
    console.log('\n📊 Resumo:');
    console.log('- Users ✅');
    console.log('- Students ✅');
    console.log('- Exercises ✅');
    console.log('- Foods ✅');
    console.log('- Workouts ✅');
    console.log('- Diets ✅');
    console.log('- Payments ✅');

  } catch (error) {
    console.error('\n❌ Erro na migração:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Desconectado do MongoDB');
    process.exit(0);
  }
};

// Executar migração
migrateData();
