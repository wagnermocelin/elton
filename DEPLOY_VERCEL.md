# 🚀 Deploy no Vercel - Guia Completo

## 📋 Visão Geral

Vamos fazer deploy de:
- **Frontend (React)** → Vercel
- **Backend (Node.js/Express)** → Vercel
- **Banco de Dados** → Supabase (já configurado)

---

## 🎯 Passo 1: Preparar o Repositório

### 1.1 Fazer Commit e Push

```bash
git add .
git commit -m "feat: configurar deploy para Vercel"
git push origin main
```

---

## 🔧 Passo 2: Deploy do Backend

### 2.1 Acessar Vercel

1. Acesse: https://vercel.com
2. Faça login com GitHub
3. Clique em **"Add New Project"**

### 2.2 Importar Repositório

1. Selecione o repositório: `wagnermocelin/elton`
2. Clique em **"Import"**

### 2.3 Configurar Backend

**Root Directory:** `backend`

**Framework Preset:** Other

**Build Command:** (deixe vazio)

**Output Directory:** (deixe vazio)

**Install Command:** `npm install`

### 2.4 Configurar Variáveis de Ambiente

Clique em **"Environment Variables"** e adicione:

```
DATABASE_URL = postgresql://postgres.fqqvrkwfjjyoagyjatud:Ihopso12%23@aws-1-sa-east-1.pooler.supabase.com:6543/postgres

JWT_SECRET = sua_chave_secreta_super_segura_aqui

JWT_EXPIRE = 30d

NODE_ENV = production

CORS_ORIGIN = https://seu-frontend.vercel.app

FRONTEND_URL = https://seu-frontend.vercel.app
```

⚠️ **IMPORTANTE:** 
- Use a mesma `DATABASE_URL` do Supabase
- Gere um `JWT_SECRET` forte (pode usar: https://randomkeygen.com/)
- Atualize `CORS_ORIGIN` depois do deploy do frontend

### 2.5 Deploy

1. Clique em **"Deploy"**
2. Aguarde o build (2-3 minutos)
3. Anote a URL do backend: `https://seu-backend.vercel.app`

---

## 🎨 Passo 3: Deploy do Frontend

### 3.1 Criar Novo Projeto no Vercel

1. Clique em **"Add New Project"** novamente
2. Selecione o mesmo repositório: `wagnermocelin/elton`

### 3.2 Configurar Frontend

**Root Directory:** `.` (raiz do projeto)

**Framework Preset:** Vite

**Build Command:** `npm run build`

**Output Directory:** `dist`

**Install Command:** `npm install`

### 3.3 Configurar Variáveis de Ambiente

Adicione:

```
VITE_API_URL = https://seu-backend.vercel.app
```

⚠️ Use a URL do backend que você anotou no passo 2.5

### 3.4 Deploy

1. Clique em **"Deploy"**
2. Aguarde o build (2-3 minutos)
3. Anote a URL do frontend: `https://seu-frontend.vercel.app`

---

## 🔄 Passo 4: Atualizar CORS no Backend

### 4.1 Voltar ao Projeto do Backend no Vercel

1. Acesse o projeto do backend
2. Vá em **Settings** → **Environment Variables**
3. Edite as variáveis:

```
CORS_ORIGIN = https://seu-frontend.vercel.app
FRONTEND_URL = https://seu-frontend.vercel.app
```

### 4.2 Fazer Redeploy

1. Vá em **Deployments**
2. Clique nos 3 pontinhos do último deploy
3. Clique em **"Redeploy"**

---

## ✅ Passo 5: Testar o Sistema

### 5.1 Acessar o Frontend

1. Acesse: `https://seu-frontend.vercel.app`
2. Faça login com: `juliana@zem.com` / `123456`

### 5.2 Verificar Funcionalidades

- ✅ Login
- ✅ Dashboard
- ✅ Alunos
- ✅ Treinos
- ✅ Dietas
- ✅ Alimentos (562 itens)
- ✅ Exercícios (145 itens)

---

## 🔧 Configurações Adicionais

### Domínio Personalizado (Opcional)

1. No projeto do frontend, vá em **Settings** → **Domains**
2. Adicione seu domínio personalizado
3. Configure DNS conforme instruções

### SSL/HTTPS

✅ Vercel fornece SSL automático e gratuito

### Logs e Monitoramento

1. Acesse **Deployments** para ver logs
2. Use **Analytics** para monitorar performance

---

## 🐛 Troubleshooting

### Erro: "Cannot GET /"

**Causa:** Backend não está respondendo  
**Solução:** Verifique se `vercel.json` está correto no backend

### Erro: CORS

**Causa:** CORS_ORIGIN não configurado  
**Solução:** Adicione a URL do frontend em `CORS_ORIGIN`

### Erro: Database Connection

**Causa:** DATABASE_URL incorreta  
**Solução:** Verifique se a string de conexão está correta (com `%23` para `#`)

### Erro: 401 Unauthorized

**Causa:** JWT_SECRET diferente entre deploys  
**Solução:** Use o mesmo JWT_SECRET em todos os deploys

---

## 📊 Estrutura Final

```
Frontend (Vercel)
  ↓ API calls
Backend (Vercel)
  ↓ Database queries
Supabase (PostgreSQL)
```

---

## 🎯 Próximos Passos

1. ✅ **Criar primeiro usuário em produção**
   ```
   POST https://seu-backend.vercel.app/api/auth/create-first-user
   ```

2. ✅ **Configurar domínio personalizado** (opcional)

3. ✅ **Monitorar logs** no Vercel Dashboard

4. ✅ **Desativar MongoDB** (não é mais necessário)

---

## 💰 Custos

- **Vercel:** Gratuito (até 100GB bandwidth/mês)
- **Supabase:** Gratuito (até 500MB database)
- **Total:** R$ 0,00/mês 🎉

---

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs no Vercel Dashboard
2. Verifique as variáveis de ambiente
3. Teste a API diretamente: `https://seu-backend.vercel.app/api/auth/login`

---

**Data:** 14 de Novembro de 2025  
**Status:** Pronto para deploy  
**Tempo estimado:** 15-20 minutos
