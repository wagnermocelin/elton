# ⚠️ AÇÃO NECESSÁRIA: Configurar .env

## Problema

O backend não consegue conectar no Supabase porque a variável `DATABASE_URL` não está configurada no arquivo `.env`.

## Solução

Abra o arquivo: `backend/.env`

E adicione esta linha (com a senha que você já tem):

```env
DATABASE_URL=postgresql://postgres.fqqvrkwfjjyoagyjatud:Ihopso12%23@aws-1-sa-east-1.pooler.supabase.com:6543/postgres
```

**IMPORTANTE:** Use `%23` no lugar do `#` na senha (codificação de URL).

## Verificar

Depois de adicionar, o arquivo `backend/.env` deve ter algo assim:

```env
PORT=5000
NODE_ENV=development

# MongoDB (LEGADO - será removido)
MONGODB_URI=mongodb+srv://...

# Supabase / Postgres (NOVO)
DATABASE_URL=postgresql://postgres.fqqvrkwfjjyoagyjatud:Ihopso12%23@aws-1-sa-east-1.pooler.supabase.com:6543/postgres

JWT_SECRET=sua_chave_secreta
JWT_EXPIRE=30d

CORS_ORIGIN=http://localhost:3000
...
```

## Próximo Passo

Depois de salvar o `.env`, me avise que eu reinicio o servidor e testo a criação do primeiro usuário.
