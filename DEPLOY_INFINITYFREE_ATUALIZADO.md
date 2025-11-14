# 🚀 Deploy Frontend no InfinityFree + Backend no Vercel

## 📋 Arquitetura

```
Frontend (InfinityFree) → Backend (Vercel) → Database (Supabase)
```

**Tudo gratuito! 🎉**

---

## ✅ Pré-requisitos

- ✅ Backend já deployado no Vercel: `https://elton-hk8q.vercel.app`
- ✅ Banco de dados no Supabase configurado
- ⏳ Build do frontend rodando...

---

## 📦 Passo 1: Aguardar Build

O comando `npm run build` está rodando. Aguarde até aparecer:
```
✓ built in XXs
```

Isso vai criar a pasta `dist/` com os arquivos otimizados.

---

## 🌐 Passo 2: Criar Conta no InfinityFree

1. Acesse: https://infinityfree.net
2. Clique em **"Sign Up"**
3. Preencha:
   - Email
   - Senha
   - Aceite os termos
4. Confirme o email

---

## 🏗️ Passo 3: Criar Site

1. No painel do InfinityFree, clique em **"Create Account"**
2. Escolha um subdomínio:
   - Ex: `powertraining` → `powertraining.infinityfreeapp.com`
   - Ou: `elton-fitness` → `elton-fitness.infinityfreeapp.com`
3. Clique em **"Create Account"**
4. Aguarde 2-5 minutos (criação do site)

---

## 📤 Passo 4: Upload dos Arquivos

### Opção A: File Manager (Mais Fácil)

1. No painel, clique em **"Control Panel"** do seu site
2. Clique em **"Online File Manager"**
3. Faça login (use as mesmas credenciais)
4. Navegue até a pasta **`htdocs`**
5. **DELETE** todos os arquivos padrão (default.php, etc.)
6. Clique em **"Upload Files"**
7. Selecione **TODOS** os arquivos da pasta `dist/`:
   - `index.html`
   - Pasta `assets/`
   - Todos os outros arquivos
8. Aguarde o upload terminar

### Opção B: FTP (Mais Rápido)

1. Baixe o **FileZilla**: https://filezilla-project.org
2. No painel do InfinityFree, vá em **"FTP Details"**
3. Anote:
   - **FTP Hostname**: `ftpupload.net`
   - **FTP Username**: `seu_usuario`
   - **FTP Password**: `sua_senha`
4. Abra o FileZilla e conecte
5. No lado direito, navegue até `/htdocs`
6. Delete arquivos padrão
7. Arraste a pasta `dist/` inteira para `/htdocs`

---

## ⚙️ Passo 5: Configurar .htaccess

Crie um arquivo `.htaccess` dentro de `htdocs` com este conteúdo:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Não reescrever arquivos existentes
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  
  # Redirecionar tudo para index.html
  RewriteRule . /index.html [L]
</IfModule>

# Habilitar compressão
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>

# Cache de arquivos estáticos
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

**Como criar no File Manager:**
1. Clique em **"New File"**
2. Nome: `.htaccess`
3. Clique com botão direito → **"Edit"**
4. Cole o conteúdo acima
5. Salve

---

## 🧪 Passo 6: Testar

1. Acesse: `https://seu-site.infinityfreeapp.com`
2. Você deve ver a tela de login
3. Tente fazer login:
   - Email: `juliana@zem.com`
   - Senha: `123456`

---

## 🔧 Passo 7: Atualizar CORS no Backend (Se Necessário)

Se der erro de CORS:

1. Acesse: https://vercel.com/dashboard
2. Vá no projeto do backend: `elton-hk8q`
3. **Settings** → **Environment Variables**
4. Adicione ou edite:
   ```
   CORS_ORIGIN
   https://seu-site.infinityfreeapp.com
   ```
5. **Deployments** → **Redeploy**

---

## 📊 Estrutura Final de Arquivos no InfinityFree

```
htdocs/
├── .htaccess          ← Você cria
├── index.html         ← Do build
├── assets/
│   ├── index-xxx.js
│   ├── index-xxx.css
│   └── ...
└── vite.svg
```

---

## 🐛 Troubleshooting

### Erro 404 ao navegar
**Causa:** `.htaccess` não está configurado  
**Solução:** Crie o arquivo `.htaccess` conforme Passo 5

### Página em branco
**Causa:** Arquivos não foram enviados corretamente  
**Solução:**
1. Abra F12 (Console)
2. Veja os erros
3. Verifique se todos os arquivos estão em `htdocs`

### API não conecta (CORS)
**Causa:** Backend não aceita requisições do InfinityFree  
**Solução:** Atualize `CORS_ORIGIN` no Vercel (Passo 7)

### Upload falha
**Causa:** Arquivo muito grande ou conexão lenta  
**Solução:** Use FTP (FileZilla) em vez do File Manager

---

## 💡 Dicas

### 1. Domínio Personalizado (Opcional)
- Compre um domínio (.com, .com.br)
- Configure no InfinityFree (gratuito)
- Ative SSL gratuito

### 2. Monitoramento
- InfinityFree tem 99% uptime
- Sem limite de banda (razoável)
- Suporta até 50.000 hits/dia

### 3. Backup
- Sempre mantenha cópia local da pasta `dist/`
- Use Git para versionamento do código fonte

### 4. Performance
- InfinityFree usa Cloudflare CDN automaticamente
- Site será rápido globalmente
- SSL/HTTPS incluído

---

## 📈 Próximos Passos

### Depois do Deploy

1. ✅ **Testar todas as funcionalidades:**
   - Login
   - CRUD de alunos
   - Treinos e dietas
   - Pagamentos

2. ✅ **Criar primeiro usuário em produção** (se necessário):
   ```
   POST https://elton-hk8q.vercel.app/api/auth/create-first-user
   ```

3. ✅ **Compartilhar o link:**
   - `https://seu-site.infinityfreeapp.com`

---

## 🎉 Resumo

**Custos:**
- Frontend (InfinityFree): R$ 0,00
- Backend (Vercel): R$ 0,00
- Database (Supabase): R$ 0,00
- **Total: R$ 0,00/mês** 🎉

**Performance:**
- ✅ SSL/HTTPS automático
- ✅ CDN global (Cloudflare)
- ✅ 99% uptime
- ✅ Rápido e confiável

**Escalabilidade:**
- Frontend: Até 50k hits/dia
- Backend: Até 100GB bandwidth/mês
- Database: Até 500MB

---

**Pronto para colocar no ar! 🚀**
