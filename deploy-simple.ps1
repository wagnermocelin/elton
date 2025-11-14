# Script de Deploy via FTP - Power Training
# Versão Simplificada

Write-Host "🚀 Deploy via FTP - Power Training" -ForegroundColor Green
Write-Host ""

# Fazer build
Write-Host "📦 Fazendo build do projeto..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro no build!" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit
}

Write-Host "✅ Build concluído!" -ForegroundColor Green
Write-Host ""
Write-Host "📤 Agora faça upload manual dos arquivos da pasta 'dist' para o InfinityFree:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Acesse: https://app.infinityfree.com" -ForegroundColor Cyan
Write-Host "2. Vá em 'File Manager'" -ForegroundColor Cyan
Write-Host "3. Entre em 'htdocs/'" -ForegroundColor Cyan
Write-Host "4. DELETE todos os arquivos antigos" -ForegroundColor Red
Write-Host "5. Clique em 'Upload'" -ForegroundColor Cyan
Write-Host "6. Selecione TODOS os arquivos da pasta 'dist/'" -ForegroundColor Cyan
Write-Host "7. Aguarde o upload completar" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Pasta 'dist' está pronta para upload!" -ForegroundColor Green
Write-Host ""

# Abrir pasta dist no Explorer
explorer dist

Write-Host "Pressione Enter para sair..."
Read-Host
