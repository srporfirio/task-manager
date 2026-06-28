# Gera APK na nuvem (Expo EAS) para instalar manualmente no celular.

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$mobile = Join-Path $root "apps\mobile"
$envFile = Join-Path $mobile ".env.local"

Set-Location $mobile

function Load-EnvFile {
  param([string]$Path)
  if (-not (Test-Path $Path)) { return }
  Get-Content $Path | ForEach-Object {
    if ($_ -match "^\s*#" -or $_ -match "^\s*$") { return }
    $pair = $_ -split "=", 2
    if ($pair.Length -eq 2) {
      $name = $pair[0].Trim()
      $value = $pair[1].Trim()
      if ($name) {
        Set-Item -Path "env:$name" -Value $value
      }
    }
  }
}

Write-Host "=== Diario de Atividades - Build APK ===" -ForegroundColor Cyan
Write-Host ""

Load-EnvFile -Path $envFile

$whoami = npx eas whoami 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Host "Conta Expo nao configurada neste terminal." -ForegroundColor Yellow
  Write-Host ""
  Write-Host "Opcao A - Login pelo navegador (conta Google):" -ForegroundColor Cyan
  Write-Host "  cd apps\mobile" -ForegroundColor White
  Write-Host "  npx expo login --browser" -ForegroundColor White
  Write-Host ""
  Write-Host "Opcao B - Token de acesso (recomendado para configurar aqui):" -ForegroundColor Cyan
  Write-Host "  1. Abra https://expo.dev/settings/access-tokens" -ForegroundColor White
  Write-Host "  2. Create token -> copie o valor" -ForegroundColor White
  Write-Host "  3. Cole em apps/mobile/.env.local:" -ForegroundColor White
  Write-Host "     EXPO_TOKEN=seu_token_aqui" -ForegroundColor White
  Write-Host "  4. Rode este script novamente" -ForegroundColor White
  exit 1
}

Write-Host "Logado como: $whoami" -ForegroundColor Green

$appJson = Get-Content "app.json" -Raw | ConvertFrom-Json
if ($appJson.expo.extra.eas.projectId -eq "pending-eas-init") {
  Write-Host "Vinculando projeto Expo (uma vez)..." -ForegroundColor Yellow
  npx eas init
  if ($LASTEXITCODE -ne 0) {
    Write-Host "Falha no eas init. Rode manualmente: npx eas init" -ForegroundColor Red
    exit 1
  }
}

Write-Host ""
Write-Host "Iniciando build APK na nuvem (perfil preview)..." -ForegroundColor Cyan
Write-Host "Ao terminar, o link do APK aparece no terminal e em https://expo.dev" -ForegroundColor Gray
Write-Host ""

$confirm = Read-Host "Confirmar envio do build EAS para a nuvem? (s/N)"
if ($confirm -notmatch '^[sS]$') {
  Write-Host "Build cancelado." -ForegroundColor Yellow
  exit 0
}

$env:EAS_NO_VCS = "1"
npx eas build --platform android --profile preview --non-interactive

if ($LASTEXITCODE -eq 0) {
  Write-Host ""
  Write-Host "Build concluido! Baixe o .apk pelo link acima e instale no celular." -ForegroundColor Green
}
