# Script de Deploy via FTP - Power Training
# Faz upload da pasta dist/ para o InfinityFree

Write-Host "🚀 Deploy via FTP - Power Training" -ForegroundColor Green
Write-Host ""

# Configurações FTP (EDITE COM SEUS DADOS)
$ftpServer = "ftpupload.net"
$ftpUsername = "if0_40238999"
$ftpPassword = "J25021989j"
$ftpPath = "/htdocs/"

# Verificar se a pasta dist existe
if (-not (Test-Path "dist")) {
    Write-Host "❌ Pasta 'dist' não encontrada!" -ForegroundColor Red
    Write-Host "Execute 'npm run build' primeiro" -ForegroundColor Yellow
    exit
}

Write-Host "📦 Fazendo build do projeto..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro no build!" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "✅ Build concluído com sucesso!" -ForegroundColor Green
Write-Host ""

# Perguntar se deseja continuar
Write-Host "⚠️  ATENÇÃO: Este script vai substituir os arquivos no servidor!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Servidor: $ftpServer" -ForegroundColor Cyan
Write-Host "Usuário: $ftpUsername" -ForegroundColor Cyan
Write-Host "Destino: $ftpPath" -ForegroundColor Cyan
Write-Host ""
$continuar = Read-Host "Deseja continuar com o upload? (s/n)"

if ($continuar -ne "s") {
    Write-Host "❌ Deploy cancelado" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "📤 Iniciando upload via FTP..." -ForegroundColor Yellow
Write-Host ""

# Função para fazer upload de um arquivo
function Upload-File {
    param (
        [string]$LocalPath,
        [string]$RemotePath
    )
    
    try {
        $webclient = New-Object System.Net.WebClient
        $webclient.Credentials = New-Object System.Net.NetworkCredential($ftpUsername, $ftpPassword)
        
        $uri = "ftp://$ftpServer$RemotePath"
        $webclient.UploadFile($uri, $LocalPath)
        
        Write-Host "  ✓ $RemotePath" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "  ✗ Erro: $RemotePath - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Função para criar diretório remoto
function Create-FtpDirectory {
    param (
        [string]$RemotePath
    )
    
    try {
        $request = [System.Net.FtpWebRequest]::Create("ftp://$ftpServer$RemotePath")
        $request.Credentials = New-Object System.Net.NetworkCredential($ftpUsername, $ftpPassword)
        $request.Method = [System.Net.WebRequestMethods+Ftp]::MakeDirectory
        $request.GetResponse() | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

# Contador de arquivos
$totalFiles = 0
$uploadedFiles = 0
$failedFiles = 0

# Contar total de arquivos
Get-ChildItem -Path "dist" -Recurse -File | ForEach-Object { $totalFiles++ }

Write-Host "Total de arquivos: $totalFiles" -ForegroundColor Cyan
Write-Host ""

# Upload de todos os arquivos
Get-ChildItem -Path "dist" -Recurse -File | ForEach-Object {
    $localFile = $_.FullName
    $relativePath = $_.FullName.Substring((Get-Location).Path.Length + 6)
    $remotePath = "$ftpPath$($relativePath.Replace('\', '/'))"
    
    # Criar diretório se necessário
    $remoteDir = Split-Path $remotePath -Parent
    if ($remoteDir -ne $ftpPath) {
        Create-FtpDirectory -RemotePath $remoteDir | Out-Null
    }
    
    # Upload do arquivo
    if (Upload-File -LocalPath $localFile -RemotePath $remotePath) {
        $uploadedFiles++
    } else {
        $failedFiles++
    }
    
    # Mostrar progresso
    $progress = [math]::Round(($uploadedFiles / $totalFiles) * 100)
    Write-Progress -Activity "Upload em progresso" -Status "$progress% Completo" -PercentComplete $progress
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Resumo do Deploy:" -ForegroundColor Green
Write-Host "  • Total de arquivos: $totalFiles" -ForegroundColor White
Write-Host "  • Enviados com sucesso: $uploadedFiles" -ForegroundColor Green
Write-Host "  • Falhas: $failedFiles" -ForegroundColor $(if ($failedFiles -gt 0) { "Red" } else { "Green" })
Write-Host ""

if ($failedFiles -eq 0) {
    Write-Host "✅ Deploy concluído com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Acesse seu site e limpe o cache (Ctrl+Shift+R)" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  Deploy concluído com alguns erros" -ForegroundColor Yellow
    Write-Host "Verifique os arquivos que falharam acima" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pressione qualquer tecla para sair..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
