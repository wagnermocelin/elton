-- ============================================
-- MIGRAÇÃO SUPABASE - POWER TRAINING
-- ============================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELA: users (Personal Trainers)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'trainer' CHECK (role IN ('trainer', 'professional', 'admin')),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);

-- ============================================
-- TABELA: students (Alunos)
-- ============================================
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255),
  is_email_verified BOOLEAN DEFAULT FALSE,
  email_verification_token VARCHAR(255),
  email_verification_expires TIMESTAMP WITH TIME ZONE,
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMP WITH TIME ZONE,
  phone VARCHAR(50),
  birth_date DATE,
  gender VARCHAR(50) CHECK (gender IN ('Masculino', 'Feminino', 'Outro')),
  join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  service_type VARCHAR(50) DEFAULT 'personal' CHECK (service_type IN ('personal', 'consultoria')),
  blocked BOOLEAN DEFAULT FALSE,
  block_reason VARCHAR(50) CHECK (block_reason IN ('payment_overdue', 'manual', NULL)),
  photo TEXT,
  trainer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_trainer ON students(trainer_id);
CREATE INDEX idx_students_status ON students(status);

-- ============================================
-- TABELA: exercises (Banco de Exercícios)
-- ============================================
CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) DEFAULT 'outro' CHECK (category IN ('peito', 'costas', 'pernas', 'ombros', 'biceps', 'triceps', 'abdomen', 'cardio', 'funcional', 'outro')),
  muscle_group VARCHAR(50) NOT NULL CHECK (muscle_group IN ('peitoral', 'dorsal', 'quadriceps', 'posterior', 'gluteos', 'deltoides', 'biceps', 'triceps', 'abdominais', 'panturrilhas', 'trapezio', 'antebracos', 'cardio', 'corpo-inteiro')),
  equipment VARCHAR(50) DEFAULT 'nenhum' CHECK (equipment IN ('barra', 'halteres', 'maquina', 'cabo', 'peso-corporal', 'elastico', 'kettlebell', 'medicine-ball', 'nenhum')),
  difficulty VARCHAR(50) DEFAULT 'intermediario' CHECK (difficulty IN ('iniciante', 'intermediario', 'avancado')),
  description TEXT,
  instructions TEXT,
  video_url TEXT,
  is_custom BOOLEAN DEFAULT FALSE,
  trainer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tags TEXT[],
  popular BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_exercises_category ON exercises(category);
CREATE INDEX idx_exercises_muscle_group ON exercises(muscle_group);
CREATE INDEX idx_exercises_trainer ON exercises(trainer_id);
CREATE INDEX idx_exercises_popular ON exercises(popular);

-- ============================================
-- TABELA: workouts (Treinos)
-- ============================================
CREATE TABLE IF NOT EXISTS workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  exercises JSONB DEFAULT '[]'::jsonb,
  trainer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_workouts_trainer ON workouts(trainer_id);

-- ============================================
-- TABELA: schedules (Cronogramas Semanais)
-- ============================================
CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  monday UUID REFERENCES workouts(id) ON DELETE SET NULL,
  tuesday UUID REFERENCES workouts(id) ON DELETE SET NULL,
  wednesday UUID REFERENCES workouts(id) ON DELETE SET NULL,
  thursday UUID REFERENCES workouts(id) ON DELETE SET NULL,
  friday UUID REFERENCES workouts(id) ON DELETE SET NULL,
  saturday UUID REFERENCES workouts(id) ON DELETE SET NULL,
  sunday UUID REFERENCES workouts(id) ON DELETE SET NULL,
  trainer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_schedules_student ON schedules(student_id);
CREATE INDEX idx_schedules_trainer ON schedules(trainer_id);

-- ============================================
-- TABELA: measurements (Avaliações Físicas)
-- ============================================
CREATE TABLE IF NOT EXISTS measurements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Dados Básicos
  weight DECIMAL(5,2),
  height DECIMAL(5,2),
  
  -- Calculados
  imc DECIMAL(5,2),
  body_fat DECIMAL(5,2),
  fat_mass DECIMAL(5,2),
  lean_mass DECIMAL(5,2),
  waist_hip_ratio DECIMAL(5,2),
  body_density DECIMAL(5,2),
  skin_fold_sum DECIMAL(5,2),
  arm_muscle_area DECIMAL(5,2),
  arm_fat_area DECIMAL(5,2),
  
  -- Circunferências
  shoulders DECIMAL(5,2),
  chest DECIMAL(5,2),
  waist DECIMAL(5,2),
  abdomen DECIMAL(5,2),
  hip DECIMAL(5,2),
  calf_left DECIMAL(5,2),
  calf_right DECIMAL(5,2),
  thigh_left DECIMAL(5,2),
  thigh_right DECIMAL(5,2),
  proximal_thigh_left DECIMAL(5,2),
  proximal_thigh_right DECIMAL(5,2),
  relaxed_arm_left DECIMAL(5,2),
  relaxed_arm_right DECIMAL(5,2),
  contracted_arm_left DECIMAL(5,2),
  contracted_arm_right DECIMAL(5,2),
  
  -- Pregas Cutâneas
  biceps_fold DECIMAL(5,2),
  triceps_fold DECIMAL(5,2),
  mid_axillary_fold DECIMAL(5,2),
  chest_fold DECIMAL(5,2),
  abdominal_fold DECIMAL(5,2),
  subscapular_fold DECIMAL(5,2),
  thigh_fold DECIMAL(5,2),
  
  trainer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_measurements_student ON measurements(student_id);
CREATE INDEX idx_measurements_trainer ON measurements(trainer_id);
CREATE INDEX idx_measurements_date ON measurements(date);

-- ============================================
-- TABELA: foods (Banco de Alimentos)
-- ============================================
CREATE TABLE IF NOT EXISTS foods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) DEFAULT 'outro' CHECK (category IN ('proteina', 'carboidrato', 'vegetal', 'fruta', 'gordura', 'lacteo', 'bebida', 'outro')),
  serving_amount DECIMAL(8,2) DEFAULT 100,
  serving_unit VARCHAR(50) DEFAULT 'g' CHECK (serving_unit IN ('g', 'ml', 'unidade', 'colher', 'xícara')),
  calories DECIMAL(8,2) NOT NULL,
  protein DECIMAL(8,2) NOT NULL,
  carbs DECIMAL(8,2) NOT NULL,
  fat DECIMAL(8,2) NOT NULL,
  fiber DECIMAL(8,2) DEFAULT 0,
  sodium DECIMAL(8,2) DEFAULT 0,
  is_custom BOOLEAN DEFAULT FALSE,
  trainer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  source VARCHAR(50) DEFAULT 'TACO',
  tags TEXT[],
  popular BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_foods_category ON foods(category);
CREATE INDEX idx_foods_trainer ON foods(trainer_id);
CREATE INDEX idx_foods_popular ON foods(popular);

-- ============================================
-- TABELA: diets (Dietas)
-- ============================================
CREATE TABLE IF NOT EXISTS diets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  goals JSONB DEFAULT '{"calories": 0, "protein": 0, "carbs": 0, "fat": 0}'::jsonb,
  totals JSONB DEFAULT '{"calories": 0, "protein": 0, "carbs": 0, "fat": 0}'::jsonb,
  meals JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  trainer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_diets_student ON diets(student_id);
CREATE INDEX idx_diets_trainer ON diets(trainer_id);
CREATE INDEX idx_diets_status ON diets(status);

-- ============================================
-- TABELA: payments (Pagamentos)
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  month VARCHAR(20) NOT NULL,
  year INTEGER NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  payment_date DATE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'overdue')),
  payment_method VARCHAR(100),
  notes TEXT,
  trainer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payments_student ON payments(student_id);
CREATE INDEX idx_payments_trainer ON payments(trainer_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_due_date ON payments(due_date);

-- ============================================
-- TABELA: configs (Configurações do Sistema)
-- ============================================
CREATE TABLE IF NOT EXISTS configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_name VARCHAR(255) DEFAULT 'Power Training',
  logo TEXT,
  trainer_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  email_config JSONB DEFAULT '{
    "enabled": true,
    "provider": "ethereal",
    "smtpHost": "",
    "smtpPort": 587,
    "smtpSecure": false,
    "smtpUser": "",
    "smtpPassword": "",
    "fromEmail": "noreply@zen.com",
    "fromName": "Power Training",
    "emailTemplates": {
      "welcomeSubject": "Bem-vindo ao Power Training - Ative sua conta",
      "welcomeEnabled": true,
      "resetPasswordSubject": "Redefinir Senha - Power Training",
      "resetPasswordEnabled": true
    }
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_configs_trainer ON configs(trainer_id);

-- ============================================
-- TRIGGERS: updated_at automático
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exercises_updated_at BEFORE UPDATE ON exercises FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workouts_updated_at BEFORE UPDATE ON workouts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_measurements_updated_at BEFORE UPDATE ON measurements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_foods_updated_at BEFORE UPDATE ON foods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_diets_updated_at BEFORE UPDATE ON diets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_configs_updated_at BEFORE UPDATE ON configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FIM DA MIGRAÇÃO
-- ============================================
