# loop-runner.ps1 — Runner del agentic loop (Windows PowerShell)
#
# Uso:
#   .\docs\ai-skills\automata-dev\loop-runner.ps1
#
# Configuración:
#   $env:AI_CMD: comando del CLI de IA a usar (default: claude)
#   Ejemplos: $env:AI_CMD = "aider"

$ErrorActionPreference = "Stop"

$NextPrompt = "docs/ai-skills/automata-dev/next-prompt.md"
$ClaimedPrompt = "$NextPrompt.running"
$AiCmd = if ($env:AI_CMD) { $env:AI_CMD } else { "claude" }
$Session = 0
$PollIntervalSeconds = if ($env:POLL_INTERVAL_SECONDS) { [int]$env:POLL_INTERVAL_SECONDS } else { 2 }
$RateLimitRetrySeconds = if ($env:RATE_LIMIT_RETRY_SECONDS) { [int]$env:RATE_LIMIT_RETRY_SECONDS } else { 300 }

Write-Host "=== Loop runner iniciado ===" -ForegroundColor Cyan
Write-Host "CLI: $AiCmd"
Write-Host "Esperando: $NextPrompt"
Write-Host ""

while ($true) {
  if (-not (Test-Path $NextPrompt)) {
    Start-Sleep -Seconds $PollIntervalSeconds
    continue
  }

  try {
    Move-Item $NextPrompt $ClaimedPrompt -ErrorAction Stop
  } catch {
    Start-Sleep -Seconds 1
    continue
  }

  $Session++
  $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  Write-Host "--- Sesión $Session — $Timestamp ---" -ForegroundColor Yellow

  $Prompt = Get-Content $ClaimedPrompt -Raw
  $RunLog = New-TemporaryFile

  Write-Host "Prompt recibido. Iniciando sesión con $AiCmd..."
  Write-Host ""

  try {
    $Prompt | & $AiCmd --print --dangerously-skip-permissions *> $RunLog.FullName
    Get-Content $RunLog.FullName
    if ($LASTEXITCODE -ne 0) {
      throw "ExitCode:$LASTEXITCODE"
    }
  } catch {
    if (Test-Path $RunLog.FullName) {
      Get-Content $RunLog.FullName
    }

    if (Test-Path $ClaimedPrompt) {
      Move-Item $ClaimedPrompt $NextPrompt -Force
    } elseif (Test-Path $NextPrompt) {
      # El prompt ya fue restaurado por otro proceso o quedó disponible.
    } else {
      Add-Content -Path "docs/ai-skills/automata-dev/loop-status.md" -Value "`n## Loop detenido — $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n- Razón: Falló la sesión del runner y no se pudo restaurar el prompt automáticamente.`n- Acción para reiniciar: Revisar el estado del runner y recrear docs/ai-skills/automata-dev/next-prompt.md si hace falta."
      Remove-Item $RunLog.FullName -Force -ErrorAction SilentlyContinue
      Write-Host "ERROR: $AiCmd falló y no existe un prompt para restaurar." -ForegroundColor Red
      exit 1
    }

    $HitRateLimit = $false
    if (Test-Path $RunLog.FullName) {
      $HitRateLimit = Select-String -Path $RunLog.FullName -Pattern "You've hit your limit" -Quiet
    }

    if ($HitRateLimit) {
      Write-Host "WARN: Claude alcanzó su límite de uso. El prompt fue restaurado en $NextPrompt." -ForegroundColor Yellow
      Write-Host "Reintentando automáticamente en $RateLimitRetrySeconds segundos."
      Remove-Item $RunLog.FullName -Force -ErrorAction SilentlyContinue
      Start-Sleep -Seconds $RateLimitRetrySeconds
      continue
    }

    Add-Content -Path "docs/ai-skills/automata-dev/loop-status.md" -Value "`n## Loop detenido — $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n- Razón: $AiCmd terminó con error en la sesión $Session.`n- Acción para reiniciar: Revisar docs/ai-skills/automata-dev/loop-status.md y relanzar el runner cuando corresponda."
    Remove-Item $RunLog.FullName -Force -ErrorAction SilentlyContinue
    Write-Host ""
    Write-Host "ERROR: $AiCmd terminó con error en la sesión $Session." -ForegroundColor Red
    Write-Host "El prompt fue restaurado en $NextPrompt para reintentar."
    Write-Host "Revisar docs/ai-skills/automata-dev/loop-status.md para detalles."
    exit 1
  }
  Remove-Item $RunLog.FullName -Force -ErrorAction SilentlyContinue

  Remove-Item $ClaimedPrompt -Force

  Write-Host ""
  Write-Host "Sesión $Session completada." -ForegroundColor Green

  # Pausa breve para evitar releer un prompt recién escrito en medio de otro proceso.
  Start-Sleep -Seconds $PollIntervalSeconds
}
