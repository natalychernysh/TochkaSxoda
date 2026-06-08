@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo  ═══════════════════════════════════════
echo   Точка схода — запуск сервера
echo  ═══════════════════════════════════════
echo.

if not exist "node_modules" (
  echo Устанавливаю зависимости...
  call npm install
  if errorlevel 1 (
    echo Ошибка npm install. Проверь, что Node.js установлен.
    pause
    exit /b 1
  )
)

if not exist "data\content.json" (
  echo Создаю content.json...
  call npm run init-content
)

for /f "tokens=2 delims==" %%p in ('findstr /B "PORT=" .env 2^>nul') do set PORT=%%p
if not defined PORT set PORT=3001

echo Порт: %PORT%
echo.
echo  Сайт:    http://localhost:%PORT%
echo  Админка: http://localhost:%PORT%/admin/
echo  Пароль:  см. ADMIN_PASSWORD в файле .env
echo.
echo  Не закрывай это окно, пока работаешь с сайтом.
echo  Остановка: Ctrl+C
echo.

start "" "http://localhost:%PORT%/admin/"

node server.js
