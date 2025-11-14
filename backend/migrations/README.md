# 🔄 Migração para Supabase (Postgres)

## 📋 Pré-requisitos

1. Projeto Supabase criado (projeto `elton`)
2. Variável `DATABASE_URL` configurada no `.env`

## 🚀 Como Executar a Migração

### Opção 1: Via Painel do Supabase (Recomendado)

1. Acesse: https://supabase.com/dashboard
2. Selecione o projeto `elton`
3. Vá em **SQL Editor** (menu lateral)
4. Clique em **New Query**
5. Copie todo o conteúdo do arquivo `001_create_tables.sql`
6. Cole no editor
7. Clique em **Run** (ou pressione `Ctrl+Enter`)
8. Aguarde a execução (deve aparecer "Success")

### Opção 2: Via psql (Terminal)

Se você tem o `psql` instalado:

```bash
psql "postgresql://postgres.fqqvrkwfjjyoagyjatud:SUA_SENHA@aws-1-sa-east-1.pooler.supabase.com:6543/postgres" -f 001_create_tables.sql
```

### Opção 3: Via Node.js Script

Criar um script Node para executar:

```javascript
import pg from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const sql = fs.readFileSync('./migrations/001_create_tables.sql', 'utf8');

pool.query(sql)
  .then(() => {
    console.log('✅ Migração executada com sucesso!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Erro na migração:', err);
    process.exit(1);
  });
```

## 📊 Tabelas Criadas

- ✅ `users` - Personal trainers
- ✅ `students` - Alunos
- ✅ `exercises` - Banco de exercícios
- ✅ `workouts` - Treinos
- ✅ `schedules` - Cronogramas semanais
- ✅ `measurements` - Avaliações físicas
- ✅ `foods` - Banco de alimentos
- ✅ `diets` - Dietas
- ✅ `payments` - Pagamentos
- ✅ `configs` - Configurações do sistema

## 🔍 Verificar se Funcionou

Após executar a migração, no painel do Supabase:

1. Vá em **Table Editor** (menu lateral)
2. Você deve ver todas as 10 tabelas listadas
3. Clique em cada uma para ver a estrutura

## ⚠️ Importante

- Esta migração é **idempotente** (pode rodar várias vezes sem problemas)
- Usa `CREATE TABLE IF NOT EXISTS`
- Não deleta dados existentes
- Cria índices para performance
- Configura triggers para `updated_at` automático

## 🔄 Próximos Passos

Depois de executar a migração:

1. ✅ Atualizar código do backend para usar Postgres
2. ✅ Migrar dados do MongoDB (se necessário)
3. ✅ Testar todas as rotas
4. ✅ Atualizar variáveis de ambiente no Render
