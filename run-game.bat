@echo off
title AIVERSE 1.0 - SARLAYASH Productions Presents - Powered By Kapil
echo ========================================================
echo   SARLAYASH PRODUCTIONS PRESENTS
echo   AIVERSE 1.0 - Powered By Kapil
echo   The Epic AI, GenAI & Agentic AI Video Game!
echo ========================================================
echo Starting local game server...
start "" "http://localhost:3000"
node "%~dp0server.js"
pause
