param(
  [int]$Port = 3000,
  [string]$BindHost = "0.0.0.0"
)

function Write-Section($title) { Write-Host "`n=== $title ===" -ForegroundColor Cyan }

Write-Section "1) Perfil de red"
$profiles = Get-NetConnectionProfile | Select-Object Name,InterfaceAlias,NetworkCategory,IPv4Connectivity
$profiles | Format-Table -AutoSize

# Si se ejecuta como Admin, intenta cambiar redes conectadas de Público a Privado
try {
  $isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltinRole]::Administrator)
  if ($isAdmin) {
    $connected = $profiles | Where-Object { $_.IPv4Connectivity -ne 'Disconnected' -and $_.NetworkCategory -eq 'Public' }
    foreach ($p in $connected) {
      Write-Host ("Cambiando '{0}' ({1}) a Privado..." -f $p.Name, $p.InterfaceAlias)
      Set-NetConnectionProfile -InterfaceAlias $p.InterfaceAlias -NetworkCategory Private -ErrorAction SilentlyContinue
    }
  } else {
    Write-Host "No eres Admin: ejecuta como Administrador para cambiar Perfil de red a Privado (recomendado)." -ForegroundColor Yellow
  }
} catch { Write-Warning "No se pudo ajustar el perfil de red: $($_.Exception.Message)" }

Write-Section "2) Backend .env"
$envPath = Join-Path $PSScriptRoot "..\backend\.env"
if (-not (Test-Path $envPath)) { Copy-Item (Join-Path $PSScriptRoot "..\backend\.env.example") $envPath -Force }
(Get-Content $envPath) -replace '^HOST=.*$', "HOST=$BindHost" | Set-Content $envPath
(Get-Content $envPath) | Write-Output

Write-Section "3) Abrir firewall (si Admin)"
$ruleName = "CafeGourmet-HTTP-$Port"
try {
  $isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltinRole]::Administrator)
  if ($isAdmin) {
    if (-not (Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue)) {
      New-NetFirewallRule -DisplayName $ruleName -Direction Inbound -LocalPort $Port -Protocol TCP -Action Allow -Profile Any | Out-Null
      Write-Host "Regla de firewall creada: $ruleName" -ForegroundColor Green
    } else { Write-Host "Regla de firewall ya existía" -ForegroundColor Yellow }
  } else {
    Write-Host "No eres Admin: abre PowerShell como Administrador para crear la regla" -ForegroundColor Yellow
  }
} catch { Write-Warning "No se pudo crear la regla: $($_.Exception.Message)" }

Write-Section "4) Construir Frontend (si es necesario)"
$frontPath = Join-Path $PSScriptRoot "..\Frontend"
Push-Location $frontPath
try {
  if (-not (Test-Path (Join-Path $frontPath "node_modules"))) { npm ci }
  npm run build
} finally { Pop-Location }

Write-Section "5) Iniciar Backend en $($BindHost):$($Port)"
$backendPath = Join-Path $PSScriptRoot "..\backend"
Push-Location $backendPath
try {
  if (-not (Test-Path (Join-Path $backendPath "node_modules"))) { npm ci }
  $env:HOST = $BindHost; $env:PORT = "$Port"

  # Intentar detener procesos escuchando en el puerto para evitar duplicados
  try {
    $owning = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($pid in $owning) {
      try {
        $proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
        if ($proc) { Write-Host ("Deteniendo proceso PID {0} ({1}) en :{2}" -f $pid, $proc.ProcessName, $Port); Stop-Process -Id $pid -Force }
      } catch {}
    }
  } catch {}

  Start-Process -FilePath node -ArgumentList 'src/app.js' -WindowStyle Hidden
  Start-Sleep -Seconds 2
  netstat -ano | Select-String ":$Port"
} finally { Pop-Location }

Write-Section "6) URL(s) para compartir"
$ips = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notmatch '^169\.' -and $_.InterfaceAlias -notmatch 'Loopback|vEthernet|Hyper-V' } | Select-Object InterfaceAlias,IPAddress
$ips | ForEach-Object { Write-Host (" - {0}: http://{1}:$Port" -f $_.InterfaceAlias, $_.IPAddress) }

Write-Host "Listo. Comparte la URL de tu interfaz activa (por ejemplo Wi-Fi)." -ForegroundColor Green
