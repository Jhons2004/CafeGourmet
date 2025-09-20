param(
    [int]$Port = 3000,
    [string]$RuleName = "CafeGourmet-HTTP-3000"
)

Write-Host "[1/3] Abriendo firewall para TCP:$Port..."
try {
    $rule = Get-NetFirewallRule -DisplayName $RuleName -ErrorAction SilentlyContinue
    if (-not $rule) {
        New-NetFirewallRule -DisplayName $RuleName -Direction Inbound -LocalPort $Port -Protocol TCP -Action Allow -Profile Any | Out-Null
        Write-Host "   -> Regla creada: $RuleName"
    } else {
        Write-Host "   -> La regla ya existe: $RuleName"
    }
} catch {
    Write-Warning "   ! No se pudo crear la regla (requiere PowerShell como Administrador)."
}

Write-Host "[2/3] Detectando IP LAN..."
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notmatch 'Loopback|vEthernet|Hyper-V' -and $_.IPAddress -notmatch '^169\.' } | Select-Object -ExpandProperty IPAddress -First 1)
if (-not $ip) {
    throw "No se encontró IP LAN válida. Conéctate a Wi-Fi o Ethernet."
}
Write-Host "   -> IP LAN: $ip"

Write-Host "[3/3] Probando acceso por IP..."
try {
    $status = (Invoke-WebRequest -UseBasicParsing "http://$($ip):$($Port)/").StatusCode
    Write-Host "   -> SPA responde con: $status"
} catch {
    Write-Warning "   ! La IP responde inaccesible desde este equipo. Revisa antivirus/firewall o que el backend esté iniciado."
}

Write-Host "URL para compartir: http://$($ip):$($Port)"
