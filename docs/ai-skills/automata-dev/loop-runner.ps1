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
$AiCmd = if ($env:AI_CMD) { $env:AI_CMD } else { "claude" }
$Session = 0

Write-Host "=== Loop runner iniciado ===" -ForegroundColor Cyan
Write-Host "CLI: $AiCmd"
Write-Host "Esperando: $NextPrompt"
Write-Host ""

while (Test-Path $NextPrompt) {
  $Session++
  $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  Write-Host "--- Sesión $Session — $Timestamp ---" -ForegroundColor Yellow

  $Prompt = Get-Content $NextPrompt -Raw
  Remove-Item $NextPrompt

  Write-Host "Prompt recibido. Iniciando sesión con $AiCmd..."
  Write-Host ""

  try {
    $Prompt | & $AiCmd --print --dangerously-skip-permissions
  } catch {
    Write-Host ""
    Write-Host "ERROR: $AiCmd terminó con error en la sesión $Session." -ForegroundColor Red
    Write-Host "Revisar docs/ai-skills/automata-dev/loop-status.md para detalles."
    exit 1
  }

  Write-Host ""
  Write-Host "Sesión $Session completada." -ForegroundColor Green

  # Pausa breve para evitar condiciones de carrera con el commit
  Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "=== Loop terminado. No hay next-prompt.md. ===" -ForegroundColor Cyan
Write-Host "Ver docs/ai-skills/automata-dev/loop-status.md para el estado final."
