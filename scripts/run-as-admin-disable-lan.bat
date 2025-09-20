@echo off
:: Elevar privilegios y ejecutar disable-lan.ps1
setlocal
whoami /groups | find "S-1-5-32-544" >NUL
if %errorlevel%==0 (
  powershell -ExecutionPolicy Bypass -File "%~dp0disable-lan.ps1"
  goto :eof
)
powershell -NoProfile -Command "Start-Process PowerShell -ArgumentList '-ExecutionPolicy Bypass -File ""%~dp0disable-lan.ps1""' -Verb RunAs"
endlocal
