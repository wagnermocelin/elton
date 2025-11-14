# 🚀 Deploy Completo no Vercel - Guia Definitivo

## 📋 Arquitetura Final

```
Frontend (Vercel) → Backend (Vercel) → Database (Supabase)
```

**Tudo gratuito e no Vercel! 🎉**

---

## 🔧 PARTE 1: Deploy do Backend

### Passo 1: Preparar o Repositório

Certifique-se de que o código está commitado:

```bash
git add .
git commit -m "preparar para deploy no vercel"
git push origin main
```

### Passo 2: Criar Projeto Backend no Vercel

1. Acesse: https://vercel.com/dashboard
2. Clique em **"Add New..."** → **"Project"**
3. Clique em **"Import Git Repository"**
4. Selecione o repositório: `wagnermocelin/elton`
5. Clique em **"Import"**

### Passo 3: Configurar Backend

Na tela de configuração:

**Framework Preset:**
- Selecione: **"Other"**

**Root Directory:**
- Clique em **"Edit"**
- Digite: `backend`
- Clique em **"Continue"**

**Build Settings:**
- Build Command: (deixe vazio)
- Output Directory: (deixe vazio)
- Install Command: `npm install`

**Environment Variables:**

Clique em **"Environment Variables"** e adicione:

```
DATABASE_URL
postgresql://postgres.fqqvrkwfjjyoagyjatud:Ihopso12%23@aws-1-sa-east-1.pooler.supabase.com:6543/postgres
```

```
JWT_SECRET
sua_chave_secreta_super_segura_123456789
```

```
JWT_EXPIRE
30d
```

```
NODE_ENV
production
```

### Passo 4: Deploy

1. Clique em **"Deploy"**
2. Aguarde 2-3 minutos
3. **Anote a URL do backend**: Ex: `https://elton-backend-xxx.vercel.app`

### Passo 5: Testar Backend

Acesse no navegador:
```
https://sua-url-backend.vercel.app
```

Deve retornar:
```json
{
  "message": "API Power Training",
  "version": "1.0.0",
  "status": "online",
  "database": "Supabase (PostgreSQL)"
}
```

---

## 🎨 PARTE 2: Deploy do Frontend

### Passo 1: Atualizar API URL

Edite o arquivo `src/config/api.js`:

```javascript
const API_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.endsWith('/api') 
    ? import.meta.env.VITE_API_URL 
    : `${import.meta.env.VITE_API_URL}/api`
  : import.meta.env.PROD 
    ? 'https://SUA-URL-BACKEND.vercel.app/api'  // ← COLE SUA URL AQUI
    : 'http://localhost:5000/api';
```

**Commit:**
```bash
git add src/config/api.js
git commit -m "atualizar URL do backend"
git push origin main
```

### Passo 2: Criar Projeto Frontend no Vercel

1. No Vercel Dashboard, clique em **"Add New..."** → **"Project"**
2. Selecione o mesmo repositório: `wagnermocelin/elton`
3. Clique em **"Import"**

### Passo 3: Configurar Frontend

**Framework Preset:**
- Selecione: **"Vite"** (deve detectar automaticamente)

**Root Directory:**
- Deixe como **"."** (raiz do projeto)

**Build Settings:**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

**Environment Variables:**
- (Opcional) Você pode adicionar `VITE_API_URL` se quiser sobrescrever

### Passo 4: Deploy

1. Clique em **"Deploy"**
2. Aguarde 2-3 minutos
3. **Anote a URL do frontend**: Ex: `https://elton-xxx.vercel.app`

---

## 🧪 PARTE 3: Testar Tudo

### Teste 1: Backend Direto

Acesse:
```
https://sua-url-backend.vercel.app
```

Deve retornar JSON com status "online".

### Teste 2: Frontend

1. Acesse: `https://sua-url-frontend.vercel.app`
2. Deve aparecer a tela de login
3. Tente fazer login:
   - Email: `juliana@zem.com`
   - Senha: `123456`

### Teste 3: Console do Navegador

Abra F12 e veja se há erros:
- ✅ Sem erros de CORS
- ✅ Requisições para o backend funcionando
- ✅ Login bem-sucedido

---

## 🔄 PARTE 4: Atualizar InfinityFree (Opcional)

Se você quiser continuar usando o InfinityFree para o frontend:

### Opção A: Usar Vercel Backend

1. Edite `src/config/api.js` localmente
2. Coloque a URL do backend do Vercel
3. Faça `npm run build`
4. Faça upload da pasta `dist/` para o InfinityFree

### Opção B: Usar Vercel para Tudo

- Apenas use a URL do Vercel frontend
- Mais rápido e confiável
- SSL automático
- CDN global

---

## 📊 Resumo das URLs

Depois do deploy, você terá:

```
Frontend: https://elton-xxx.vercel.app
Backend:  https://elton-backend-xxx.vercel.app
Database: Supabase (já configurado)
```

---

## 🐛 Troubleshooting

### Erro: "Cannot find module"
**Causa:** Vercel não encontrou as dependências  
**Solução:** Verifique se `package.json` está no diretório correto

### Erro: CORS
**Causa:** Backend não aceita requisições do frontend  
**Solução:** O CORS já está aberto (`*`) no código, deve funcionar

### Erro: Database connection
**Causa:** Variável `DATABASE_URL` não configurada  
**Solução:** Adicione no Vercel → Settings → Environment Variables

### Build falha no Frontend
**Causa:** Erro no código ou dependências  
**Solução:** Rode `npm run build` localmente primeiro para ver o erro

### Backend retorna 404
**Causa:** Vercel não encontrou `api/index.js`  
**Solução:** Verifique se o Root Directory está como `backend`

---

## 💡 Dicas Importantes

### 1. Domínio Personalizado

Depois do deploy, você pode adicionar um domínio próprio:
1. Compre um domínio (.com, .com.br)
2. No Vercel → Settings → Domains
3. Adicione o domínio
4. Configure DNS conforme instruções

### 2. Monitoramento

- Vercel tem analytics gratuito
- Veja logs em: Deployments → Clique no deploy → Logs
- Monitore erros em tempo real

### 3. Redeployment

Para fazer redeploy:
1. Faça commit e push no GitHub
2. Vercel faz deploy automático
3. Ou: Deployments → ... → Redeploy

### 4. Environment Variables

Para adicionar/editar variáveis:
1. Settings → Environment Variables
2. Adicione/edite
3. Redeploy para aplicar

---

## 🎯 Checklist Final

### Backend:
- [ ] Projeto criado no Vercel
- [ ] Root Directory = `backend`
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy bem-sucedido
- [ ] URL anotada
- [ ] Teste retorna JSON

### Frontend:
- [ ] `api.js` atualizado com URL do backend
- [ ] Código commitado
- [ ] Projeto criado no Vercel
- [ ] Framework = Vite
- [ ] Deploy bem-sucedido
- [ ] URL anotada
- [ ] Login funciona

---

## 🎉 Pronto!

Agora você tem uma aplicação completa rodando no Vercel:
- ✅ Frontend React + Vite
- ✅ Backend Node.js + Express
- ✅ Database PostgreSQL (Supabase)
- ✅ SSL/HTTPS automático
- ✅ CDN global
- ✅ Deploy automático via Git
- ✅ **100% Gratuito!**

**Custos mensais: R$ 0,00** 🎉
