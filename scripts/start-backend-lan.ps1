param(
    [int]$BindPort = 3000,
    [string]$BindHost = "0.0.0.0"
)

$backendPath = Join-Path $PSScriptRoot "..\backend"
if (-not (Test-Path $backendPath)) { throw "No se encontró carpeta backend" }

Push-Location $backendPath
try {
    if (-not (Test-Path ".env")) { Copy-Item ".env.example" ".env" -Force }
        # Intentar cerrar proceso existente en el puerto indicado
        try {
            $conn = Get-NetTCPConnection -LocalPort $BindPort -State Listen -ErrorAction SilentlyContinue
            if ($conn) {
                $pid = $conn.OwningProcess
                Write-Host "Deteniendo proceso existente en puerto ${BindPort} (PID $pid)..."
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                Start-Sleep -Seconds 1
            }
        } catch { Write-Warning "No se pudo determinar proceso en puerto ${BindPort}: $($_.Exception.Message)" }
        $env:HOST = $BindHost
        $env:PORT = "$BindPort"
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw "Node no está en PATH" }
        Write-Host "Iniciando backend en ${BindHost}:${BindPort}..."
    Start-Process -FilePath node -ArgumentList 'src/app.js' -WindowStyle Hidden
    Start-Sleep -Seconds 2
        $listening = (netstat -ano | Select-String ":${BindPort}").ToString()
        if ($listening -notmatch "LISTENING") { Write-Warning "No se detecta LISTENING en :${BindPort}" } else { Write-Host "Backend escuchando en :${BindPort}" }
} finally {
    Pop-Location
}
