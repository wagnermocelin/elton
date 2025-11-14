# 📦 Guia de Migração de Dados: MongoDB → Supabase

## 🎯 Objetivo

Migrar todos os dados existentes do MongoDB para o Supabase (PostgreSQL) mantendo a integridade e relacionamentos.

---

## ⚠️ Pré-requisitos

Antes de executar a migração, certifique-se de que:

1. ✅ **Tabelas criadas no Supabase**
   - Execute o script `backend/migrations/001_create_tables.sql` no Supabase
   - Verifique se todas as 10 tabelas foram criadas

2. ✅ **Variáveis de ambiente configuradas**
   - `MONGODB_URI` - String de conexão do MongoDB
   - `DATABASE_URL` - String de conexão do Supabase

3. ✅ **Backend funcionando**
   - Teste de conexão com ambos os bancos bem-sucedido

---

## 🚀 Como Executar a Migração

### Opção 1: Script PowerShell (Recomendado)

```powershell
# Na raiz do projeto
.\migrar-dados-mongodb.ps1
```

### Opção 2: Comando Node.js Direto

```bash
cd backend
node scripts/migrate-data.js
```

---

## 📊 O Que Será Migrado

### 1. Users (Trainers/Profissionais)
- ✅ Nome, email, senha (hash)
- ✅ Role, status
- ✅ Datas de criação

### 2. Students (Alunos)
- ✅ Dados pessoais
- ✅ Tokens de verificação
- ✅ Relacionamento com trainer
- ✅ Status de bloqueio

### 3. Exercises (Exercícios)
- ✅ Nome, categoria, grupo muscular
- ✅ Equipamento, dificuldade
- ✅ Descrição, instruções, vídeo
- ✅ Tags, popularidade

### 4. Foods (Alimentos)
- ✅ Nome, categoria
- ✅ Informações nutricionais
- ✅ Porção, unidade
- ✅ Tags, popularidade

### 5. Workouts (Treinos)
- ✅ Nome, descrição
- ✅ **Exercícios (JSONB)**
- ✅ Relacionamento com trainer

### 6. Diets (Dietas)
- ✅ Nome, metas
- ✅ **Refeições (JSONB)**
- ✅ Totais calculados
- ✅ Relacionamento com student e trainer

### 7. Payments (Pagamentos)
- ✅ Mês, ano, valor
- ✅ Datas de vencimento e pagamento
- ✅ Status, método
- ✅ Relacionamento com student e trainer

### 8. Measurements (Avaliações)
- ✅ Todas as medidas corporais
- ✅ Relacionamento com student e trainer

### 9. Schedules (Cronogramas)
- ✅ Dias da semana
- ✅ Relacionamento com workouts
- ✅ Relacionamento com student e trainer

### 10. Configs (Configurações)
- ✅ Nome da academia, logo
- ✅ **Configurações de email (JSONB)**
- ✅ Relacionamento com trainer

---

## 🔄 Ordem de Migração

O script migra os dados na ordem correta para respeitar as foreign keys:

1. **Users** (primeiro, pois outros dependem dele)
2. **Students** (depende de Users)
3. **Exercises** (independente)
4. **Foods** (independente)
5. **Workouts** (depende de Users)
6. **Diets** (depende de Students e Users)
7. **Payments** (depende de Students e Users)
8. **Measurements** (depende de Students e Users)
9. **Schedules** (depende de Students, Users e Workouts)
10. **Configs** (depende de Users)

---

## 🛡️ Segurança

### Dados Duplicados
- O script usa `ON CONFLICT DO NOTHING` para evitar duplicação
- Se um email já existe, o registro é ignorado
- Seguro executar múltiplas vezes

### Senhas
- ✅ Senhas já hasheadas no MongoDB são copiadas como estão
- ✅ Nenhuma senha é exposta em texto plano
- ✅ Bcrypt hash é mantido

### Relacionamentos
- ✅ IDs do MongoDB são convertidos para UUIDs do Postgres
- ✅ Foreign keys são resolvidas automaticamente
- ✅ Registros órfãos são ignorados (ex: student sem trainer)

---

## 📝 Logs e Monitoramento

Durante a migração, você verá:

```
🚀 Iniciando migração de dados MongoDB → Supabase

✅ Conectado ao MongoDB

👤 Migrando Users...
📊 Total de users no MongoDB: 5
✅ Users migrados: 5/5

🎓 Migrando Students...
📊 Total de students no MongoDB: 23
✅ Students migrados: 23/23

💪 Migrando Exercises...
📊 Total de exercises no MongoDB: 150
✅ Exercises migrados: 150/150

...

✅ Migração concluída com sucesso!
```

---

## ⚠️ Possíveis Erros

### 1. "Connection terminated unexpectedly"
**Causa:** Pool de conexões esgotado  
**Solução:** Aguarde alguns segundos e execute novamente

### 2. "Trainer não encontrado para student"
**Causa:** Student referencia um trainer que não existe  
**Solução:** Normal, o student será pulado (órfão)

### 3. "Duplicate key value violates unique constraint"
**Causa:** Dados já foram migrados  
**Solução:** Normal, o `ON CONFLICT` ignora duplicatas

### 4. "DATABASE_URL não está configurada"
**Causa:** Variável de ambiente não encontrada  
**Solução:** Configure o `.env` corretamente

---

## ✅ Verificação Pós-Migração

### 1. Verificar Contagem de Registros

```sql
-- No Supabase SQL Editor
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'students', COUNT(*) FROM students
UNION ALL
SELECT 'exercises', COUNT(*) FROM exercises
UNION ALL
SELECT 'foods', COUNT(*) FROM foods
UNION ALL
SELECT 'workouts', COUNT(*) FROM workouts
UNION ALL
SELECT 'diets', COUNT(*) FROM diets
UNION ALL
SELECT 'payments', COUNT(*) FROM payments
UNION ALL
SELECT 'measurements', COUNT(*) FROM measurements
UNION ALL
SELECT 'schedules', COUNT(*) FROM schedules
UNION ALL
SELECT 'configs', COUNT(*) FROM configs;
```

### 2. Testar Login no Frontend
- Faça login com um usuário existente
- Verifique se os dados aparecem corretamente

### 3. Verificar Relacionamentos
```sql
-- Verificar students com trainers
SELECT s.name as student, u.name as trainer
FROM students s
JOIN users u ON s.trainer_id = u.id
LIMIT 10;
```

---

## 🔄 Rollback (Se Necessário)

Se algo der errado, você pode limpar os dados do Supabase:

```sql
-- ⚠️ CUIDADO: Isso apaga TODOS os dados!
TRUNCATE TABLE configs CASCADE;
TRUNCATE TABLE schedules CASCADE;
TRUNCATE TABLE measurements CASCADE;
TRUNCATE TABLE payments CASCADE;
TRUNCATE TABLE diets CASCADE;
TRUNCATE TABLE workouts CASCADE;
TRUNCATE TABLE foods CASCADE;
TRUNCATE TABLE exercises CASCADE;
TRUNCATE TABLE students CASCADE;
TRUNCATE TABLE users CASCADE;
```

Depois execute a migração novamente.

---

## 📊 Próximos Passos

Após a migração bem-sucedida:

1. ✅ **Testar o sistema completo**
   - Login, CRUD de alunos, treinos, dietas, etc.

2. ✅ **Fazer backup do MongoDB**
   ```bash
   mongodump --uri="MONGODB_URI" --out=./backup-mongodb
   ```

3. ✅ **Desativar MongoDB (opcional)**
   - Remover `MONGODB_URI` do `.env`
   - Cancelar assinatura do MongoDB Atlas

4. ✅ **Deploy no Render**
   - Atualizar `DATABASE_URL` no Render
   - Fazer deploy da nova versão

---

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs do script
2. Verifique se as tabelas existem no Supabase
3. Verifique se as variáveis de ambiente estão corretas
4. Execute a migração novamente (é seguro)

---

**Data:** 14 de Novembro de 2025  
**Versão:** 1.0  
**Status:** Pronto para uso
