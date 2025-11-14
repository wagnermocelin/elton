# 🚀 Migração para Supabase - Passo a Passo

## ✅ O que já foi feito

1. ✅ Driver Postgres (`pg`) instalado no backend
2. ✅ Configuração de conexão criada (`config/supabase.js`)
3. ✅ Script SQL completo gerado (`migrations/001_create_tables.sql`)
4. ✅ Variável `DATABASE_URL` configurada no `.env`

## 📋 Próximo Passo: Executar SQL no Supabase

### 1. Acessar o Painel do Supabase

1. Abra: https://supabase.com/dashboard
2. Faça login
3. Selecione o projeto **elton**

### 2. Executar o Script SQL

1. No menu lateral, clique em **SQL Editor**
2. Clique em **New Query** (botão verde)
3. Abra o arquivo: `backend/migrations/001_create_tables.sql`
4. **Copie TODO o conteúdo** do arquivo
5. **Cole** no editor SQL do Supabase
6. Clique em **Run** (ou pressione `Ctrl+Enter`)
7. Aguarde alguns segundos
8. Deve aparecer: **"Success. No rows returned"**

### 3. Verificar se as Tabelas Foram Criadas

1. No menu lateral, clique em **Table Editor**
2. Você deve ver **10 tabelas** criadas:
   - ✅ users
   - ✅ students
   - ✅ exercises
   - ✅ workouts
   - ✅ schedules
   - ✅ measurements
   - ✅ foods
   - ✅ diets
   - ✅ payments
   - ✅ configs

3. Clique em cada tabela para ver a estrutura (colunas, tipos, índices)

### 4. Confirmar Comigo

Depois de executar, me avise:

- ✅ "SQL executado com sucesso, tabelas criadas"
- ❌ "Deu erro: [copie a mensagem de erro aqui]"

## 🔄 Depois da Migração SQL

Após confirmar que as tabelas foram criadas, vou:

1. Atualizar o `server.js` para usar a conexão Supabase
2. Criar helpers/repositories para acessar o banco
3. Migrar as rotas principais (`auth`, `students`, `payments`)
4. Testar o backend com o Supabase
5. Migrar dados do MongoDB (se necessário)

## ⚠️ Importante

- O script SQL é **seguro** (usa `IF NOT EXISTS`)
- Pode rodar várias vezes sem problemas
- Não deleta nada
- Cria apenas a estrutura (tabelas vazias)

## 📞 Dúvidas?

Se tiver qualquer erro ou dúvida durante a execução do SQL, copie a mensagem de erro completa e me envie.

---

**Aguardando você executar o SQL no Supabase!** 🚀
