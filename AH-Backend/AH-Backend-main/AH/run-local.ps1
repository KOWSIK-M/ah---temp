param(
    [string]$AdminEmail = $env:LOCAL_ADMIN_EMAIL,
    [string]$AdminPassword = $env:LOCAL_ADMIN_PASSWORD
)

$ErrorActionPreference = 'Stop'
$projectDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectDirectory

docker compose -f compose.local.yml up -d

$env:JAVA_HOME = 'C:\Program Files\Java\jdk-21.0.12.1'
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
$env:SPRING_PROFILES_ACTIVE = 'local'
$env:DATABASE_URL = 'jdbc:postgresql://localhost:5432/anjaneya_herbals'
$env:DATABASE_USERNAME = 'anjaneya'
$env:DATABASE_PASSWORD = 'anjaneya_local_only'
$env:APP_FRONTEND_URL = 'http://localhost:5173'
$env:APP_OAUTH2_REDIRECT_URI = 'http://localhost:5173/oauth2/redirect'
$env:CORS_ORIGINS = 'http://localhost:5173,http://127.0.0.1:5173'
$env:COOKIE_SECURE = 'false'
$env:GOOGLE_CLIENT_ID = 'local-google-client-id'
$env:GOOGLE_CLIENT_SECRET = 'local-google-client-secret'
$env:JWT_SECRET = 'local-development-jwt-secret-anjaneya-herbals-keep-this-at-least-sixty-four-characters'

if ($AdminEmail -and $AdminPassword) {
    $env:LOCAL_ADMIN_EMAIL = $AdminEmail
    $env:LOCAL_ADMIN_PASSWORD = $AdminPassword
}

Write-Host 'Starting Anjaneya Herbals backend at http://localhost:8888' -ForegroundColor Green
mvn spring-boot:run
