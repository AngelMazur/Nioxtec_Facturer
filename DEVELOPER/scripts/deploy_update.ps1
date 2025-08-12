Continue = 'Continue'
function Write-Log { param([string])  = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'; Write-Host "[] " }
C:\Nioxtec\Nioxtec_Facturer   = 'C:\Nioxtec\Nioxtec_Facturer'
 = Join-Path C:\Nioxtec\Nioxtec_Facturer 'logs'
if (-not (Test-Path )) { New-Item -ItemType Directory -Path  | Out-Null }
 = Join-Path  ("deploy_{0}.log" -f (Get-Date -Format 'yyyyMMdd_HHmmss'))
try { Start-Transcript -Path  -Append | Out-Null } catch {}
try {
  Write-Log '== Despliegue NORMAL =='
  Set-Location C:\Nioxtec\Nioxtec_Facturer
   = Join-Path C:\Nioxtec\Nioxtec_Facturer 'DEVELOPER\scripts\sync_repo.ps1'
  if (Test-Path ) { &  } else { Write-Log 'sync_repo.ps1 no encontrado, fetch+pull'; git fetch origin; =(git rev-parse --abbrev-ref HEAD).Trim(); if (-not ){='main'}; git pull --ff-only origin  }
  if (Test-Path '.\.venv310\Scripts\python.exe') { Write-Log 'Instalando deps backend'; .\.venv310\Scripts\python.exe -m pip install -r requirements.txt } else { Write-Log 'AVISO: venv .venv310 no encontrado' }
  Write-Log 'Construyendo frontend'
  Set-Location (Join-Path C:\Nioxtec\Nioxtec_Facturer 'frontend')
  npm ci
  if (-not https://api.nioxtec.es) { https://api.nioxtec.es='https://api.nioxtec.es' }
  npm run build
  Write-Log 'Reiniciando tareas'
  try { schtasks /End /TN "Nioxtec Backend"  | Out-Null } catch {}
  try { schtasks /End /TN "Nioxtec Frontend" | Out-Null } catch {}
  Start-Sleep -Seconds 2
  try { schtasks /Run /TN "Nioxtec Backend"  | Out-Null } catch {}
  try { schtasks /Run /TN "Nioxtec Frontend" | Out-Null } catch {}
  Write-Log 'Health-check'
  =False
  for (=1;  -le 6; ++){ Start-Sleep -Seconds 5; try { =(Invoke-WebRequest https://api.nioxtec.es/health -UseBasicParsing -TimeoutSec 10).StatusCode; Write-Log ("Intento {0}: {1}" -f ,); if ( -eq 200){ =True; break } } catch { Write-Log ("Intento {0} error: {1}" -f ,.Exception.Message) } }
  if (){ Write-Log 'Despliegue OK' } else { Write-Log 'Health-check falló' }
} finally { try { Stop-Transcript | Out-Null } catch {}; 0=0 }
