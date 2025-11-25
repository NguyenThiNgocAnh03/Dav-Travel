@echo off
chcp 65001 >nul
echo =======================================
echo  Starting JSON Server for travel-api/db.json ...
echo =======================================

REM Kiểm tra JSON Server đã cài chưa
where json-server >nul 2>nul
if %errorlevel% neq 0 (
    echo  JSON Server chưa được cài. Đang cài đặt...
    npm install -g json-server
)

echo.
echo  JSON Server đã sẵn sàng! Khởi động server...
json-server --watch travel-api/db.json --port 3000

pause
