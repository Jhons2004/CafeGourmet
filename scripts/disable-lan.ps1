param(
  [int]$Port = 3000
)

function Write-Section($title) { Write-Host "`n=== $title ===" -ForegroundColor Cyan }

Write-Section "1) Reconfigurar .env a local"
$envPath = Join-Path $PSScriptRoot "..\backend\.env"
if (-not (Test-Path $envPath)) { Copy-Item (Join-Path $PSScriptRoot "..\backend\.env.example") $envPath -Force }
(Get-Content $envPath) -replace '^HOST=.*$', "HOST=127.0.0.1" | Set-Content $envPath
(Get-Content $envPath) | Write-Output

Write-Section "2) Quitar regla de firewall (si Admin)"
$ruleName = "CafeGourmet-HTTP-$Port"
try {
  $isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltinRole]::Administrator)
  if ($isAdmin) {
    $rule = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue
    if ($rule) { Remove-NetFirewallRule -DisplayName $ruleName | Out-Null; Write-Host "Regla eliminada: $ruleName" -ForegroundColor Green }
    else { Write-Host "No había regla de firewall $ruleName" -ForegroundColor Yellow }
  } else { Write-Host "No eres Admin: ejecuta como Administrador para eliminar la regla" -ForegroundColor Yellow }
} catch { Write-Warning "No se pudo quitar la regla: $($_.Exception.Message)" }

Write-Section "3) Detener procesos en puerto :$Port"
try {
  $owningPids = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
  if ($owningPids) {
    foreach ($pp in $owningPids) {
      try { $proc = Get-Process -Id $pp -ErrorAction SilentlyContinue; if ($proc) { Write-Host ("Deteniendo PID {0} ({1})" -f $pp, $proc.ProcessName); Stop-Process -Id $pp -Force } } catch {}
    }
  } else { Write-Host "No hay procesos escuchando en :$Port" }
} catch { Write-Warning "No se pudo enumerar conexiones: $($_.Exception.Message)" }

Write-Section "4) Iniciar backend en 127.0.0.1:$Port"
$backendPath = Join-Path $PSScriptRoot "..\backend"
Push-Location $backendPath
try {
  if (-not (Test-Path (Join-Path $backendPath "node_modules"))) { npm ci }
  $env:HOST = "127.0.0.1"; $env:PORT = "$Port"
  Start-Process -FilePath node -ArgumentList 'src/app.js' -WindowStyle Hidden
  Start-Sleep -Seconds 2
  netstat -ano | Select-String ":$Port"
} finally { Pop-Location }

Write-Section "5) Validación"
try {
  $local = (Invoke-WebRequest -UseBasicParsing "http://127.0.0.1:$($Port)/api/health").StatusCode
  Write-Host "127.0.0.1/api/health -> $local"
} catch { Write-Warning "No respondió en loopback" }

try {
  $lanIps = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notmatch '^169\\.' -and $_.InterfaceAlias -notmatch 'Loopback|vEthernet|Hyper-V' } | Select-Object -ExpandProperty IPAddress
  foreach ($ip in $lanIps) {
    try { Invoke-WebRequest -UseBasicParsing "http://$($ip):$($Port)/api/health" -TimeoutSec 2 | Out-Null; Write-Warning "AÚN responde por $ip. Revisa que HOST no esté sobrescrito en runtime." }
    catch { Write-Host "No responde por $ip (esperado)." }
  }
} catch {}

Write-Host "Listo: servicio local únicamente (127.0.0.1). Comparte solo en esta PC." -ForegroundColor Green
