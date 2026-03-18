@echo off
chcp 65001 >nul
title Dashboard Fiscalizacao - Instalacao

echo.
echo  ╔══════════════════════════════════════════════╗
echo  ║   Dashboard Fiscalizacao                     ║
echo  ║   Lojas Maia + Lider Colchoes                ║
echo  ║   Instalacao Automatica                      ║
echo  ╚══════════════════════════════════════════════╝
echo.

:: Check Node.js
echo [1/4] Verificando Node.js...
node --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo  ERRO: Node.js nao encontrado!
    echo  Baixe em: https://nodejs.org
    pause
    exit /b
)
echo  OK - Node.js encontrado
echo.

:: Install dependencies
echo [2/4] Instalando dependencias (pode levar 1-2 minutos)...
call npm install
if %ERRORLEVEL% neq 0 (
    echo  ERRO na instalacao. Tente rodar novamente.
    pause
    exit /b
)
echo  OK - Dependencias instaladas
echo.

:: Start server
echo [3/4] Iniciando o dashboard...
echo.
echo  ╔══════════════════════════════════════════════╗
echo  ║                                              ║
echo  ║   Dashboard rodando em:                      ║
echo  ║   http://localhost:3000                      ║
echo  ║                                              ║
echo  ║   O navegador vai abrir automaticamente.     ║
echo  ║                                              ║
echo  ║   Para PARAR: feche esta janela              ║
echo  ║   ou pressione Ctrl+C                        ║
echo  ║                                              ║
echo  ╚══════════════════════════════════════════════╝
echo.

call npm run dev
