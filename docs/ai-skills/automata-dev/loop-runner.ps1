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

  Write-Host "Prompt recibido. Iniciando sesión con $AiCmd..."
  Write-Host ""

  try {
    $Prompt | & $AiCmd --print --dangerously-skip-permissions
  } catch {
    Move-Item $ClaimedPrompt $NextPrompt -Force
    Write-Host ""
    Write-Host "ERROR: $AiCmd terminó con error en la sesión $Session." -ForegroundColor Red
    Write-Host "El prompt fue restaurado en $NextPrompt para reintentar."
    Write-Host "Revisar docs/ai-skills/automata-dev/loop-status.md para detalles."
    exit 1
  }

  Remove-Item $ClaimedPrompt -Force

  Write-Host ""
  Write-Host "Sesión $Session completada." -ForegroundColor Green

  # Pausa breve para evitar releer un prompt recién escrito en medio de otro proceso.
  Start-Sleep -Seconds $PollIntervalSeconds
}
