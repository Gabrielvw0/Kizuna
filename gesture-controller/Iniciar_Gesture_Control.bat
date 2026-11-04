@echo off
title KIZUNA 絆 — Stage Gesture Controller V4.0
cd /d "%~dp0"
echo ==========================================================
echo   GLOBANT KIZUNA (絆) — STAGE GESTURE CONTROLLER (V4.0)
echo   WebSocket Server (ws://127.0.0.1:8765) + Emulação de Teclas
echo ==========================================================
echo.
echo Verificando dependencias Python (opencv-python, mediapipe, websockets, pynput)...
python -m pip install -r requirements.txt --quiet
echo.
echo Iniciando controlador de gestos...
echo Deixe a janela do navegador Kizuna em foco no projetor!
echo.
python main.py
pause
