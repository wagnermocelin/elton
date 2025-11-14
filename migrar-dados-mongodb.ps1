#!/usr/bin/env pwsh

Write-Host "🚀 Migração de Dados: MongoDB → Supabase" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se está na pasta correta
if (-not (Test-Path "backend/scripts/migrate-data.js")) {
    Write-Host "❌ Erro: Execute este script na raiz do projeto" -ForegroundColor Red
    exit 1
}

# Verificar se o .env existe
if (-not (Test-Path "backend/.env")) {
    Write-Host "❌ Erro: Arquivo backend/.env não encontrado" -ForegroundColor Red
    Write-Host "Configure as variáveis DATABASE_URL e MONGODB_URI primeiro" -ForegroundColor Yellow
    exit 1
}

Write-Host "📋 Pré-requisitos:" -ForegroundColor Yellow
Write-Host "  ✓ MongoDB URI configurado no .env" -ForegroundColor Green
Write-Host "  ✓ Supabase DATABASE_URL configurado no .env" -ForegroundColor Green
Write-Host "  ✓ Tabelas já criadas no Supabase" -ForegroundColor Green
Write-Host ""

Write-Host "⚠️  ATENÇÃO:" -ForegroundColor Yellow
Write-Host "  - Esta migração irá copiar TODOS os dados do MongoDB para o Supabase" -ForegroundColor Yellow
Write-Host "  - Dados duplicados serão ignorados (ON CONFLICT DO NOTHING)" -ForegroundColor Yellow
Write-Host "  - O processo pode demorar alguns minutos dependendo da quantidade de dados" -ForegroundColor Yellow
Write-Host ""

$confirmation = Read-Host "Deseja continuar? (s/n)"
if ($confirmation -ne 's' -and $confirmation -ne 'S') {
    Write-Host "❌ Migração cancelada pelo usuário" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "🔄 Iniciando migração..." -ForegroundColor Cyan
Write-Host ""

# Executar script de migração
Set-Location backend
node scripts/migrate-data.js

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Migração concluída com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Próximos passos:" -ForegroundColor Cyan
    Write-Host "  1. Verificar os dados no Supabase Dashboard" -ForegroundColor White
    Write-Host "  2. Testar o frontend para garantir que tudo funciona" -ForegroundColor White
    Write-Host "  3. Fazer backup do MongoDB antes de desativar" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ Erro na migração. Verifique os logs acima." -ForegroundColor Red
}

Set-Location ..
