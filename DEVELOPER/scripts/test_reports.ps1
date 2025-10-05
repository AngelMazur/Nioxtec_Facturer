# Script para probar los endpoints de reportes
# Verifica que el backend responda correctamente

$ErrorActionPreference = "Stop"

Write-Host "============================================================" -ForegroundColor Blue
Write-Host "TEST DE ENDPOINTS DE REPORTES" -ForegroundColor Blue
Write-Host "============================================================" -ForegroundColor Blue
Write-Host ""

$baseUrl = "http://127.0.0.1:5001"

# Función para hacer peticiones HTTP
function Test-Endpoint {
    param (
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Body = $null,
        [string]$Token = $null
    )
    
    Write-Host "Probando: $Name" -ForegroundColor Cyan
    Write-Host "  URL: $Url" -ForegroundColor Gray
    
    try {
        $headers = @{
            "Content-Type" = "application/json"
        }
        
        if ($Token) {
            $headers["Authorization"] = "Bearer $Token"
        }
        
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $headers
            UseBasicParsing = $true
        }
        
        if ($Body) {
            $params["Body"] = ($Body | ConvertTo-Json)
        }
        
        $response = Invoke-WebRequest @params
        
        if ($response.StatusCode -eq 200) {
            Write-Host "  [OK] Status: $($response.StatusCode)" -ForegroundColor Green
            $content = $response.Content | ConvertFrom-Json
            if ($content) {
                Write-Host "  Datos recibidos:" -ForegroundColor Gray
                $content | Format-List | Out-String | ForEach-Object { $_.Split("`n") | Select-Object -First 10 } | ForEach-Object { Write-Host "    $_" -ForegroundColor DarkGray }
            }
            return $true
        } else {
            Write-Host "  [FAIL] Status: $($response.StatusCode)" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "  [ERROR] $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            Write-Host "  Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
        }
        return $false
    } finally {
        Write-Host ""
    }
}

# 1. Verificar que el backend está corriendo
Write-Host "1. Verificando que el backend está corriendo..." -ForegroundColor Yellow
try {
    $healthCheck = Invoke-WebRequest -Uri "$baseUrl/health" -UseBasicParsing -ErrorAction SilentlyContinue
    if ($healthCheck.StatusCode -ne 200) {
        throw "El backend no responde"
    }
    Write-Host "  [OK] Backend corriendo" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] El backend no está corriendo en $baseUrl" -ForegroundColor Red
    Write-Host "  Por favor, inicia el backend primero con: .\start_backend.ps1" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# 2. Hacer login para obtener el token
Write-Host "2. Obteniendo token de autenticación..." -ForegroundColor Yellow
$loginBody = @{
    username = "admin"
    password = "admin"
}

try {
    $loginResponse = Invoke-WebRequest `
        -Uri "$baseUrl/api/login" `
        -Method POST `
        -Body ($loginBody | ConvertTo-Json) `
        -ContentType "application/json" `
        -UseBasicParsing
    
    $loginData = $loginResponse.Content | ConvertFrom-Json
    $token = $loginData.access_token
    
    if (-not $token) {
        throw "No se recibió token"
    }
    
    Write-Host "  [OK] Token obtenido" -ForegroundColor Green
    Write-Host "  Token (primeros 20 chars): $($token.Substring(0, [Math]::Min(20, $token.Length)))..." -ForegroundColor Gray
} catch {
    Write-Host "  [ERROR] No se pudo hacer login" -ForegroundColor Red
    Write-Host "  $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 3. Probar endpoints de reportes
Write-Host "3. Probando endpoints de reportes..." -ForegroundColor Yellow
Write-Host ""

$year = (Get-Date).Year
$month = (Get-Date).Month

$passed = 0
$failed = 0

# Test 1: Combined summary
if (Test-Endpoint -Name "Combined Summary" -Url "$baseUrl/api/reports/combined_summary?year=$year" -Token $token) {
    $passed++
} else {
    $failed++
}

# Test 2: Heatmap
if (Test-Endpoint -Name "Heatmap" -Url "$baseUrl/api/reports/heatmap?year=$year&month=$month" -Token $token) {
    $passed++
} else {
    $failed++
}

# Test 3: Summary
if (Test-Endpoint -Name "Summary" -Url "$baseUrl/api/reports/summary?year=$year" -Token $token) {
    $passed++
} else {
    $failed++
}

# Test 4: Expenses Summary
if (Test-Endpoint -Name "Expenses Summary" -Url "$baseUrl/api/reports/expenses_summary?year=$year" -Token $token) {
    $passed++
} else {
    $failed++
}

# Resumen
Write-Host "============================================================" -ForegroundColor Blue
Write-Host "RESUMEN" -ForegroundColor Blue
Write-Host "============================================================" -ForegroundColor Blue
Write-Host "Tests pasados: $passed" -ForegroundColor Green
Write-Host "Tests fallidos: $failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
Write-Host ""

if ($failed -eq 0) {
    Write-Host "[OK] TODOS LOS TESTS PASARON" -ForegroundColor Green
    Write-Host ""
    Write-Host "Los endpoints de reportes funcionan correctamente." -ForegroundColor Green
    Write-Host "Si no ves reportes en el frontend, verifica:" -ForegroundColor Yellow
    Write-Host "  1. Que el frontend esté conectándose a la URL correcta del backend" -ForegroundColor Yellow
    Write-Host "  2. Que el token JWT se esté enviando correctamente" -ForegroundColor Yellow
    Write-Host "  3. Que haya datos en la base de datos (facturas y gastos)" -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "[FAIL] ALGUNOS TESTS FALLARON" -ForegroundColor Red
    exit 1
}
