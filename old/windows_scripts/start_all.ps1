schtasks /Run /TN "Nioxtec Backend" | Out-Null
schtasks /Run /TN "Nioxtec Frontend" | Out-Null
Write-Host "Servicios de app iniciados."

