@echo off
cd /d %~dp0
echo Starting AI Agent Service...
REM Windows 上 8000 端口可能被系统排除（Excluded Port Range），导致 WinError 10013。
REM 默认改为 8100；如需自定义，修改下面两行即可。
set AGENT_HOST=127.0.0.1
set AGENT_PORT=8100
python main.py
pause
