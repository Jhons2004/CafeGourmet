param(
    [int]$Port = 3000,
    [string]$Host = "0.0.0.0"
)

$backendPath = Join-Path $PSScriptRoot "..\backend"
if (-not (Test-Path $backendPath)) { throw "No se encontró carpeta backend" }

Push-Location $backendPath
try {
    if (-not (Test-Path ".env")) { Copy-Item ".env.example" ".env" -Force }
    $env:HOST = $Host
    $env:PORT = "$Port"
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw "Node no está en PATH" }
    Write-Host "Iniciando backend en $Host:$Port..."
    Start-Process -FilePath node -ArgumentList 'src/app.js' -WindowStyle Hidden
    Start-Sleep -Seconds 2
    $listening = (netstat -ano | Select-String ":$Port").ToString()
    if ($listening -notmatch "LISTENING") { Write-Warning "No se detecta LISTENING en :$Port" } else { Write-Host "Backend escuchando en :$Port" }
} finally {
    Pop-Location
}
