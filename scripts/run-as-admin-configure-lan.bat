@echo off
:: Elevar privilegios y ejecutar configure-lan-server.ps1
setlocal

:: Detectar si ya somos admin
whoami /groups | find "S-1-5-32-544" >NUL
if %errorlevel%==0 (
  powershell -ExecutionPolicy Bypass -File "%~dp0configure-lan-server.ps1"
  goto :eof
)

:: Si no somos admin, relanzar con elevación UAC
powershell -NoProfile -Command "Start-Process PowerShell -ArgumentList '-ExecutionPolicy Bypass -File ""%~dp0configure-lan-server.ps1""' -Verb RunAs"

endlocal
