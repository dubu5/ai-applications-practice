@echo off
REM Quiz Add - Windows Batch Wrapper
REM 사용법: quiz-add.cmd history easy

setlocal enabledelayedexpansion

REM 인자 확인
if "%1"=="" (
    echo.
    echo [!] 사용법: quiz-add.cmd ^<카테고리^> ^<난이도^>
    echo.
    echo [!] 카테고리: history, science, geography, general
    echo [!] 난이도: easy, medium, hard
    echo.
    echo 예:
    echo   quiz-add.cmd history easy
    echo   quiz-add.cmd science medium
    echo.
    exit /b 1
)

if "%2"=="" (
    echo.
    echo [!] 사용법: quiz-add.cmd ^<카테고리^> ^<난이도^>
    echo.
    exit /b 1
)

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
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0quiz-add.ps1" %1 %2

if errorlevel 1 (
    echo.
    echo [X] 추가 실패
    exit /b 1
)

echo.
