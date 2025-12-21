@echo off
echo ========================================
echo   Equivocal Legal - Java Backend
echo ========================================
echo.

REM 检查 Java 版本
java -version 2>nul
if errorlevel 1 (
    echo [错误] 未找到 Java，请安装 JDK 17 或更高版本
    pause
    exit /b 1
)

echo.
echo 正在启动 Spring Boot 应用...
echo 服务地址: http://localhost:8080
echo.

REM 使用 Maven Wrapper 启动
call mvnw.cmd spring-boot:run

pause