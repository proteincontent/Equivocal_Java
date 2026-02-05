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
echo 正在加载本地环境变量...
if exist .env (
    REM 直接逐行读取 .env 文件并设置环境变量
    for /f "eol=# tokens=1,* delims==" %%a in (.env) do (
        if not "%%a"=="" (
            set "%%a=%%b"
        )
    )
    echo [成功] 已加载 .env 配置
) else (
    echo [警告] 未找到 .env 文件，将使用默认配置
)

echo.
echo 验证关键配置...
if defined RESEND_API_KEY (
    echo   [OK] RESEND_API_KEY 已配置 (长度: %RESEND_API_KEY:~0,10%...)
) else (
    echo   [警告] RESEND_API_KEY 未配置!
)
if defined RESEND_FROM_EMAIL (
    echo   [OK] RESEND_FROM_EMAIL: %RESEND_FROM_EMAIL%
) else (
    echo   [警告] RESEND_FROM_EMAIL 未配置!
)
if defined SPRING_DATASOURCE_URL (
    echo   [OK] SPRING_DATASOURCE_URL 已配置
) else (
    echo   [警告] SPRING_DATASOURCE_URL 未配置!
)

echo.
echo 正在启动 Spring Boot 应用...
echo 服务地址: http://localhost:8080
echo.

REM 使用 Maven Wrapper 启动
call mvnw.cmd spring-boot:run

pause