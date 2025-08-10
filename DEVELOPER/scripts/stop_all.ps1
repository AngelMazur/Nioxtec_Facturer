schtasks /End /TN "Nioxtec Backend" | Out-Null
schtasks /End /TN "Nioxtec Frontend" | Out-Null
Write-Host "Servicios de app detenidos."

