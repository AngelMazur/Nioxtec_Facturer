# Script de Limpieza Segura - Nioxtec Facturer
# Elimina archivos temporales y cache sin afectar la funcionalidad

Write-Host "`n================================================================" -ForegroundColor Cyan
Write-Host "   Limpieza Segura del Proyecto Nioxtec_Facturer" -ForegroundColor Cyan  
Write-Host "================================================================`n" -ForegroundColor Cyan

# Guardar tamaño inicial
$initialSize = (Get-ChildItem -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "Tamaño inicial del proyecto: $([math]::Round($initialSize, 2)) MB`n" -ForegroundColor Yellow

# Contadores
$filesDeleted = 0
$spaceFreed = 0

# 1. Limpiar __pycache__ en raíz
Write-Host "[1/5] Limpiando __pycache__ en raíz..." -ForegroundColor Green
if (Test-Path "__pycache__") {
    $size = (Get-ChildItem "__pycache__" -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB
    $count = (Get-ChildItem "__pycache__" -Recurse -File).Count
    Remove-Item -Recurse -Force "__pycache__"
    $filesDeleted += $count
    $spaceFreed += $size
    Write-Host "  [OK] Eliminado: $count archivos, $([math]::Round($size, 2)) MB" -ForegroundColor White
}
else {
    Write-Host "  [INFO] No encontrado" -ForegroundColor Gray
}

# 2. Limpiar todos los archivos .pyc
Write-Host "`n[2/5] Limpiando archivos .pyc..." -ForegroundColor Green
$pycFiles = Get-ChildItem -Recurse -Filter "*.pyc" -ErrorAction SilentlyContinue
if ($pycFiles.Count -gt 0) {
    $size = ($pycFiles | Measure-Object -Property Length -Sum).Sum / 1MB
    $count = $pycFiles.Count
    $pycFiles | Remove-Item -Force -ErrorAction SilentlyContinue
    $filesDeleted += $count
    $spaceFreed += $size
    Write-Host "  [OK] Eliminado: $count archivos, $([math]::Round($size, 2)) MB" -ForegroundColor White
}
else {
    Write-Host "  [INFO] No se encontraron archivos .pyc" -ForegroundColor Gray
}

# 3. Limpiar PDFs en downloads/
Write-Host "`n[3/5] Limpiando PDFs en downloads/..." -ForegroundColor Green
if (Test-Path "downloads") {
    $pdfs = Get-ChildItem "downloads\*.pdf" -ErrorAction SilentlyContinue
    if ($pdfs.Count -gt 0) {
        $size = ($pdfs | Measure-Object -Property Length -Sum).Sum / 1MB
        $count = $pdfs.Count
        
        # Preguntar confirmacion
        Write-Host "  [AVISO] Se encontraron $count PDFs ($([math]::Round($size, 2)) MB)" -ForegroundColor Yellow
        $confirm = Read-Host "  Eliminar? (s/N)"
        
        if ($confirm -eq 's' -or $confirm -eq 'S') {
            $pdfs | Remove-Item -Force
            $filesDeleted += $count
            $spaceFreed += $size
            Write-Host "  [OK] Eliminado: $count archivos, $([math]::Round($size, 2)) MB" -ForegroundColor White
        }
        else {
            Write-Host "  [INFO] Omitido por el usuario" -ForegroundColor Gray
        }
    }
    else {
        Write-Host "  [INFO] No se encontraron PDFs" -ForegroundColor Gray
    }
}
else {
    Write-Host "  [INFO] Directorio downloads/ no existe" -ForegroundColor Gray
}

# 4. Limpiar directorios __pycache__ recursivos
Write-Host "`n[4/5] Limpiando directorios __pycache__ recursivos..." -ForegroundColor Green
$pycacheDirs = Get-ChildItem -Recurse -Directory -Filter "__pycache__" -ErrorAction SilentlyContinue
if ($pycacheDirs.Count -gt 0) {
    $totalSize = 0
    $totalFiles = 0
    
    foreach ($dir in $pycacheDirs) {
        $files = Get-ChildItem $dir.FullName -Recurse -File -ErrorAction SilentlyContinue
        $totalFiles += $files.Count
        $totalSize += ($files | Measure-Object -Property Length -Sum).Sum / 1MB
    }
    
    $pycacheDirs | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
    $filesDeleted += $totalFiles
    $spaceFreed += $totalSize
    Write-Host "  [OK] Eliminado: $totalFiles archivos en $($pycacheDirs.Count) directorios, $([math]::Round($totalSize, 2)) MB" -ForegroundColor White
}
else {
    Write-Host "  [INFO] No se encontraron directorios __pycache__" -ForegroundColor Gray
}

# 5. Limpiar logs antiguos (opcional)
Write-Host "`n[5/5] Verificando logs antiguos..." -ForegroundColor Green
$oldLogs = Get-ChildItem -Filter "*.log" -ErrorAction SilentlyContinue | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-7) }
if ($oldLogs.Count -gt 0) {
    $size = ($oldLogs | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "  [AVISO] Se encontraron $($oldLogs.Count) logs antiguos (>7 dias) - $([math]::Round($size, 2)) MB" -ForegroundColor Yellow
    $confirm = Read-Host "  Eliminar? (s/N)"
    
    if ($confirm -eq 's' -or $confirm -eq 'S') {
        $oldLogs | Remove-Item -Force
        $filesDeleted += $oldLogs.Count
        $spaceFreed += $size
        Write-Host "  [OK] Eliminado: $($oldLogs.Count) archivos, $([math]::Round($size, 2)) MB" -ForegroundColor White
    }
    else {
        Write-Host "  [INFO] Omitido por el usuario" -ForegroundColor Gray
    }
}
else {
    Write-Host "  [INFO] No se encontraron logs antiguos" -ForegroundColor Gray
}

# Calcular tamaño final
$finalSize = (Get-ChildItem -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB

# Resumen
Write-Host "`n================================================================" -ForegroundColor Green
Write-Host "                    RESUMEN DE LIMPIEZA" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Archivos eliminados:  $filesDeleted" -ForegroundColor White
Write-Host "  Espacio liberado:     $([math]::Round($spaceFreed, 2)) MB" -ForegroundColor White
Write-Host "  Tamaño inicial:       $([math]::Round($initialSize, 2)) MB" -ForegroundColor Yellow
Write-Host "  Tamaño final:         $([math]::Round($finalSize, 2)) MB" -ForegroundColor Green
Write-Host "  Reduccion:            $([math]::Round(($initialSize - $finalSize), 2)) MB ($([math]::Round((($initialSize - $finalSize) / $initialSize) * 100, 1))%)" -ForegroundColor Cyan
Write-Host ""
Write-Host "[OK] Limpieza completada exitosamente!" -ForegroundColor Green
Write-Host ""
