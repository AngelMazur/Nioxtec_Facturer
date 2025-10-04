# 🧹 Plan de Limpieza del Proyecto

**Fecha:** 4 de octubre de 2025
**Tamaño total de archivos innecesarios:** 129.45 MB (8,677 archivos)

## 1. Archivos a Eliminar Inmediatamente

### A. Directorio `__pycache__` en raíz
```powershell
Remove-Item -Recurse -Force "__pycache__"
```
**Razón:** Archivos compilados de Python que no deben estar en el repositorio.

### B. PDFs en `downloads/`
```powershell
Get-ChildItem "downloads\*.pdf" | Remove-Item -Force
```
**Razón:** Archivos generados en runtime. Mantener solo .gitkeep si es necesario.
**Espacio liberado:** ~1.91 MB

### C. Archivos `.pyc` dispersos
```powershell
Get-ChildItem -Recurse -Filter "*.pyc" | Remove-Item -Force
```
**Razón:** Archivos compilados regenerables automáticamente.

### D. Entornos virtuales adicionales (solo si no se usan)
```powershell
# Verificar cuál venv se está usando actualmente
# Solo eliminar después de confirmar
# Remove-Item -Recurse -Force ".venv_20251004202832"
# Remove-Item -Recurse -Force ".venv_20251004203144"
```
**Advertencia:** Mantener al menos 1 venv funcional.
**Espacio potencial:** ~238 MB

### E. Frontend venv antiguo
```powershell
Remove-Item -Recurse -Force "frontend\.venv310"
```
**Razón:** Entorno virtual antiguo. El proyecto debería usar frontend/.venv
**Espacio liberado:** Variable (grandes MB)

## 2. Verificar y Actualizar .gitignore

### Entradas Críticas (ya presentes, verificar):
```gitignore
# Python
__pycache__/
*.pyc
*.pyo
.venv*/

# Runtime generated
downloads/
downloads/*.pdf

# Personal data
~/

# Logs
*.log
backend_output.log
backend.log

# Frontend
frontend/.venv310/
```

## 3. Limpiar Git Cache (si archivos ya fueron commiteados)

Si algunos archivos innecesarios ya están en Git:

```powershell
# Ver qué archivos están rastreados que no deberían
git ls-files | Select-String -Pattern '\.pyc$|\.log$|downloads/.*\.pdf$'

# Si se encuentra algo, limpiar cache:
git rm -r --cached __pycache__
git rm --cached *.pyc
git rm --cached downloads/*.pdf
git commit -m "chore: remover archivos innecesarios del repositorio"
```

## 4. Comandos de Limpieza Completa

### Opción Conservadora (solo archivos seguros):
```powershell
# Limpieza básica
Remove-Item -Recurse -Force "__pycache__" -ErrorAction SilentlyContinue
Get-ChildItem -Recurse -Filter "*.pyc" | Remove-Item -Force
Get-ChildItem "downloads\*.pdf" | Remove-Item -Force

# Verificar espacio liberado
$before = (Get-ChildItem -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "Espacio ocupado después de limpieza: $([math]::Round($before, 2)) MB"
```

### Opción Agresiva (incluye venvs viejos):
```powershell
# ADVERTENCIA: Solo ejecutar si se tiene backup y se sabe qué venv usar

# 1. Backup de venv activo (si es necesario)
# Copy-Item -Recurse ".venv_20251004203144" ".venv_backup"

# 2. Eliminar venvs viejos excepto el más reciente
$venvs = Get-ChildItem -Directory -Filter ".venv_*" | Sort-Object LastWriteTime -Descending
$venvs | Select-Object -Skip 1 | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue

# 3. Limpiar frontend venv antiguo
Remove-Item -Recurse -Force "frontend\.venv310" -ErrorAction SilentlyContinue

# 4. Limpieza estándar
Remove-Item -Recurse -Force "__pycache__" -ErrorAction SilentlyContinue
Get-ChildItem -Recurse -Filter "*.pyc" | Remove-Item -Force
Get-ChildItem "downloads\*.pdf" | Remove-Item -Force
```

## 5. Prevención Futura

### A. Agregar pre-commit hook
Crear `.git/hooks/pre-commit`:
```bash
#!/bin/sh
# Prevenir commit de archivos innecesarios
if git diff --cached --name-only | grep -E '\.pyc$|__pycache__|downloads/.*\.pdf$'; then
    echo "Error: Intentando commitear archivos innecesarios (.pyc, __pycache__, PDFs)"
    exit 1
fi
```

### B. Script de limpieza regular
Crear `scripts/cleanup.ps1`:
```powershell
Write-Host "Limpiando archivos temporales..." -ForegroundColor Cyan

# Python cache
Get-ChildItem -Recurse -Filter "*.pyc" | Remove-Item -Force
Get-ChildItem -Recurse -Directory -Filter "__pycache__" | Remove-Item -Recurse -Force

# Downloads viejos (más de 30 días)
Get-ChildItem "downloads\*.pdf" | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) } | Remove-Item -Force

# Logs viejos
Get-ChildItem -Filter "*.log" | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-7) } | Remove-Item -Force

Write-Host "Limpieza completada!" -ForegroundColor Green
```

### C. GitHub Action para verificar
Agregar a `.github/workflows/check-unwanted-files.yml`:
```yaml
name: Check Unwanted Files
on: [push, pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Check for unwanted files
        run: |
          if git ls-files | grep -E '\.pyc$|__pycache__|downloads/.*\.pdf$'; then
            echo "Error: Unwanted files found in repository"
            exit 1
          fi
```

## 6. Resumen de Espacio a Liberar

| Categoría | Archivos | Espacio |
|-----------|----------|---------|
| __pycache__ y .pyc | ~8,677 | ~129.45 MB |
| downloads/*.pdf | 36 | ~1.91 MB |
| .venv antiguos | 2-3 | ~238 MB (opcional) |
| frontend/.venv310 | Muchos | Variable |
| **TOTAL MÍNIMO** | **~8,700** | **~131 MB** |
| **TOTAL MÁXIMO** | **~8,700+** | **~369+ MB** |

## 7. Checklist de Ejecución

- [ ] Hacer backup del proyecto completo
- [ ] Verificar qué venv se está usando actualmente
- [ ] Ejecutar limpieza conservadora primero
- [ ] Verificar que el backend/frontend sigan funcionando
- [ ] Ejecutar limpieza agresiva (opcional)
- [ ] Actualizar .gitignore si es necesario
- [ ] Limpiar Git cache si archivos ya están commiteados
- [ ] Commit de cambios
- [ ] Configurar scripts de prevención
- [ ] Documentar en README.md los comandos de limpieza

## 8. Notas Importantes

1. **Directorio `~/`:** Ya está correctamente en .gitignore. NO es un directorio real del proyecto, es un enlace simbólico a tu home de Windows.

2. **DEVELOPER/CONVERSATIONS/:** Correctamente ignorado. Contiene logs de conversaciones con IA.

3. **Venvs múltiples:** El GitHub Action ahora solo mantiene los 3 más recientes. Considera usar solo 1 venv y renombrarlo a `.venv` simple.

4. **Frontend:** Parece tener venv duplicado (.venv310). Verificar si el frontend usa su propio venv o el del backend.

## 9. Comando Rápido para Auditoría

```powershell
# Ver resumen de espacio por categoría
Write-Host "`n=== AUDIT DEL PROYECTO ===" -ForegroundColor Yellow

$pycache = (Get-ChildItem -Recurse -Directory -Filter "__pycache__" | ForEach-Object { Get-ChildItem $_.FullName -Recurse -File } | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "__pycache__: $([math]::Round($pycache, 2)) MB" -ForegroundColor Red

$pyc = (Get-ChildItem -Recurse -Filter "*.pyc" | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host ".pyc files: $([math]::Round($pyc, 2)) MB" -ForegroundColor Red

$downloads = (Get-ChildItem "downloads\*.pdf" -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "downloads/*.pdf: $([math]::Round($downloads, 2)) MB" -ForegroundColor Red

$venvs = (Get-ChildItem -Directory -Filter ".venv_*" | ForEach-Object { 
    $size = (Get-ChildItem $_.FullName -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "$($_.Name): $([math]::Round($size, 2)) MB" -ForegroundColor Cyan
})

Write-Host "`n=== RECOMENDACIÓN ===" -ForegroundColor Green
Write-Host "Ejecuta: .\DEVELOPER\scripts\cleanup_safe.ps1" -ForegroundColor White
```
