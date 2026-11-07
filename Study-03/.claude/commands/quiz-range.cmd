@echo off
REM Quiz Range Review - Windows Batch Wrapper
REM 사용법: quiz-range.cmd 1 10

setlocal enabledelayedexpansion

REM 인자 확인
if "%1"=="" (
    echo.
    echo [!] 사용법: quiz-range.cmd ^<start^> ^<end^>
    echo.
    echo 예:
    echo   quiz-range.cmd 1 10      ^(1번부터 10번까지^)
    echo   quiz-range.cmd 11 20     ^(11번부터 20번까지^)
    echo.
    exit /b 1
)

if "%2"=="" (
    echo.
    echo [!] 사용법: quiz-range.cmd ^<start^> ^<end^>
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
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0quiz-range.ps1" %1 %2

if errorlevel 1 (
    echo.
    echo [X] 검토 실패
    exit /b 1
)

echo.
