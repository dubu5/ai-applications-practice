@echo off
REM Quiz Validation - Windows Batch Wrapper
REM 사용법: quiz-validate.cmd

setlocal enabledelayedexpansion

REM 프로젝트 루트 확인
if not exist "apps\web\src\data\questions.json" (
    echo.
    echo [X] 에러: 파일을 찾을 수 없습니다
    echo     경로: apps\web\src\data\questions.json
    echo.
    echo [!] 팁: 프로젝트 루트에서 실행하세요
    echo.
    exit /b 1
)

REM PowerShell 스크립트 실행
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0quiz-validate.ps1" %*

if errorlevel 1 (
    echo.
    echo [X] 검증 실패
    exit /b 1
)

echo.
