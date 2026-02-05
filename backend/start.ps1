$ErrorActionPreference = 'Stop'

Write-Host "========================================"
Write-Host "  Equivocal Legal - Java Backend"
Write-Host "========================================"
Write-Host ""

Set-Location -Path $PSScriptRoot

function Set-EnvFromDotEnvFile {
  param([string]$Path)

  if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
    return
  }

  foreach ($line in Get-Content -LiteralPath $Path -ErrorAction Stop) {
    $trim = $line.Trim()
    if ($trim.Length -eq 0) { continue }
    if ($trim.StartsWith('#')) { continue }

    $idx = $trim.IndexOf('=')
    if ($idx -lt 1) { continue }

    $key = $trim.Substring(0, $idx).Trim()
    $val = $trim.Substring($idx + 1)
    if ($key.Length -eq 0) { continue }

    # Don't print values; just set for child processes.
    [System.Environment]::SetEnvironmentVariable($key, $val, "Process")
  }
}

Write-Host "Loading local environment variables..."
Set-EnvFromDotEnvFile -Path ".env"

function Ensure-JwtSecret {
  $secret = [System.Environment]::GetEnvironmentVariable("JWT_SECRET", "Process")
  if ([string]::IsNullOrWhiteSpace($secret) -or ([Text.Encoding]::UTF8.GetByteCount($secret) -lt 32)) {
    Write-Host "  [WARN] JWT_SECRET missing/too short. Generating a dev secret and writing to .env (gitignored)."

    $bytes = New-Object byte[] 48
    [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
    $secret = [Convert]::ToBase64String($bytes)
    [System.Environment]::SetEnvironmentVariable("JWT_SECRET", $secret, "Process")

    if (-not (Test-Path -LiteralPath ".env" -PathType Leaf)) {
      Set-Content -LiteralPath ".env" -Value @(
        "# Local dev env (DO NOT COMMIT)"
      ) -Encoding Ascii
    }

    Add-Content -LiteralPath ".env" -Value ("JWT_SECRET=" + $secret) -Encoding Ascii
    Write-Host "  [OK] JWT_SECRET generated and saved to .env"
  } else {
    Write-Host "  [OK] JWT_SECRET is set"
  }
}

Write-Host ""
Write-Host "Validating config..."
Ensure-JwtSecret

if ([string]::IsNullOrWhiteSpace([System.Environment]::GetEnvironmentVariable("RESEND_API_KEY", "Process"))) {
  Write-Host "  [WARN] RESEND_API_KEY is not set"
} else {
  Write-Host "  [OK] RESEND_API_KEY is set"
}

if ([string]::IsNullOrWhiteSpace([System.Environment]::GetEnvironmentVariable("RESEND_FROM_EMAIL", "Process"))) {
  Write-Host "  [WARN] RESEND_FROM_EMAIL is not set"
} else {
  Write-Host "  [OK] RESEND_FROM_EMAIL is set"
}

if ([string]::IsNullOrWhiteSpace([System.Environment]::GetEnvironmentVariable("SPRING_DATASOURCE_URL", "Process"))) {
  Write-Host "  [WARN] SPRING_DATASOURCE_URL is not set (defaults to localhost in application.yml)"
} else {
  Write-Host "  [OK] SPRING_DATASOURCE_URL is set"
}

Write-Host ""
Write-Host "Starting Spring Boot..."
Write-Host "Service: http://localhost:8080"
Write-Host ""

& .\mvnw.cmd spring-boot:run
$exit = $LASTEXITCODE

if (-not $env:CODEX_NO_PAUSE) {
  Write-Host ""
  Read-Host "Press Enter to exit"
}

exit $exit

