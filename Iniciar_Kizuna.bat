@echo off
chcp 65001 >nul
title KIZUNA - GLOBAL REACH. LOCAL TRUST.
cd /d "%~dp0"
echo ========================================================
echo   KIZUNA - GLOBAL REACH. LOCAL TRUST.
echo   Iniciando servidor em http://localhost:5173
echo   (Feche esta janela para encerrar a apresentacao)
echo ========================================================
if not exist node_modules (
  echo Instalando dependencias pela primeira vez...
  call npm.cmd install
)
call npm.cmd run dev
pause
