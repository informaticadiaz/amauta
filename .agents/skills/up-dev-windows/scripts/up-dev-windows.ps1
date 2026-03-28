[CmdletBinding()]
param(
  [string]$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..\..\..')).Path,
  [string]$FrontendWorkspace = '@amauta/web',
  [string]$BackendWorkspace = '@amauta/api',
  [string]$BackendEnvPath = '',
  [string]$BackendHealthUrl = 'http://localhost:3001/health',
  [switch]$SkipInstall,
  [switch]$NoNewWindows
)

$ErrorActionPreference = 'Stop'

function Write-Step {
  param([string]$Message)
  Write-Host ""
  Write-Host "==> $Message" -ForegroundColor Cyan
}

function Require-File {
  param(
    [string]$Path,
    [string]$Label
  )

  if (-not (Test-Path -LiteralPath $Path)) {
    throw "Falta $Label en: $Path"
  }
}

function Get-EnvValue {
  param(
    [string]$FilePath,
    [string]$Key
  )

  $match = Select-String -LiteralPath $FilePath -Pattern "^\s*$([regex]::Escape($Key))\s*=\s*(.+)\s*$" | Select-Object -First 1
  if (-not $match) {
    return $null
  }

  return $match.Matches[0].Groups[1].Value.Trim()
}

function Require-EnvKeys {
  param(
    [string]$FilePath,
    [string[]]$Keys,
    [string]$Label
  )

  $missing = @()
  foreach ($key in $Keys) {
    $value = Get-EnvValue -FilePath $FilePath -Key $key
    if ([string]::IsNullOrWhiteSpace($value)) {
      $missing += $key
    }
  }

  if ($missing.Count -gt 0) {
    throw "$Label no tiene estas claves requeridas: $($missing -join ', ')"
  }
}

function Test-Health {
  param(
    [string]$Url,
    [int]$Attempts = 30,
    [int]$DelaySeconds = 2
  )

  for ($i = 1; $i -le $Attempts; $i++) {
    try {
      Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 5 | Out-Null
      return $true
    } catch {
      Start-Sleep -Seconds $DelaySeconds
    }
  }

  return $false
}

$repoRootResolved = (Resolve-Path $RepoRoot).Path
$webEnvPath = Join-Path $repoRootResolved 'apps\web\.env.local'
$apiEnvResolved = if ([string]::IsNullOrWhiteSpace($BackendEnvPath)) {
  Join-Path $repoRootResolved 'apps\api\.env.local'
} elseif ([System.IO.Path]::IsPathRooted($BackendEnvPath)) {
  $BackendEnvPath
} else {
  Join-Path $repoRootResolved $BackendEnvPath
}

Write-Step "Validando archivos de entorno"
Require-File -Path $webEnvPath -Label 'apps/web/.env.local'
Require-File -Path $apiEnvResolved -Label 'apps/api/.env.local'
Require-EnvKeys -FilePath $webEnvPath -Keys @('API_URL', 'NEXT_PUBLIC_API_URL', 'NEXTAUTH_URL', 'AUTH_SECRET') -Label 'apps/web/.env.local'
Require-EnvKeys -FilePath $apiEnvResolved -Keys @('DATABASE_URL', 'JWT_SECRET', 'AUTH_SECRET') -Label 'apps/api/.env.local'

$webAuthSecret = Get-EnvValue -FilePath $webEnvPath -Key 'AUTH_SECRET'
$apiAuthSecret = Get-EnvValue -FilePath $apiEnvResolved -Key 'AUTH_SECRET'
if ($webAuthSecret -ne $apiAuthSecret) {
  throw "AUTH_SECRET no coincide entre frontend y backend."
}

Write-Step "Verificando Node y npm"
$nodeVersion = node --version
$npmVersion = npm --version
Write-Host "Node: $nodeVersion"
Write-Host "npm:  $npmVersion"

if (-not $SkipInstall) {
  Write-Step "Sincronizando dependencias"
  Push-Location $repoRootResolved
  try {
    npm install
  } finally {
    Pop-Location
  }
}

$backendCommand = "`$env:DOTENV_CONFIG_PATH='$apiEnvResolved'; npm run start:dev --workspace=$BackendWorkspace"
$frontendCommand = "npm run dev --workspace=$FrontendWorkspace"

Write-Step "Levantando backend"
if ($NoNewWindows) {
  $backendJob = Start-Job -ScriptBlock {
    param($root, $envPath, $workspace)
    Set-Location $root
    $env:DOTENV_CONFIG_PATH = $envPath
    npm run start:dev --workspace=$workspace
  } -ArgumentList $repoRootResolved, $apiEnvResolved, $BackendWorkspace
  Write-Host "Backend iniciado en background job: $($backendJob.Id)"
} else {
  Start-Process powershell -ArgumentList @(
    '-NoExit',
    '-Command',
    "Set-Location '$repoRootResolved'; $backendCommand"
  ) | Out-Null
}

Write-Step "Esperando healthcheck del backend"
if (-not (Test-Health -Url $BackendHealthUrl)) {
  throw "El backend no respondió en $BackendHealthUrl. Revisá la terminal del API."
}
Write-Host "Backend OK en $BackendHealthUrl" -ForegroundColor Green

Write-Step "Levantando frontend"
if ($NoNewWindows) {
  $frontendJob = Start-Job -ScriptBlock {
    param($root, $workspace)
    Set-Location $root
    npm run dev --workspace=$workspace
  } -ArgumentList $repoRootResolved, $FrontendWorkspace
  Write-Host "Frontend iniciado en background job: $($frontendJob.Id)"
} else {
  Start-Process powershell -ArgumentList @(
    '-NoExit',
    '-Command',
    "Set-Location '$repoRootResolved'; $frontendCommand"
  ) | Out-Null
}

Write-Step "Entorno listo"
Write-Host "Backend health: $BackendHealthUrl"
Write-Host "Frontend esperado: http://localhost:3000"
Write-Host "Siguiente paso sugerido: abrir /login y probar el flujo autenticado." -ForegroundColor Yellow
