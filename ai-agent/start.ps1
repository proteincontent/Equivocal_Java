param(
  [string]$HostAddress = "127.0.0.1",
  [int]$Port = 8100,
  [switch]$NoReload
)

Set-Location -Path $PSScriptRoot

Write-Host "Starting AI Agent Service..." -ForegroundColor Cyan

# Windows 上 8000 端口可能被系统排除（Excluded Port Range），这里默认用 8100。
$env:AGENT_HOST = $HostAddress
$env:AGENT_PORT = "$Port"
$env:AGENT_RELOAD = if ($NoReload) { "false" } else { "true" }

python .\main.py
