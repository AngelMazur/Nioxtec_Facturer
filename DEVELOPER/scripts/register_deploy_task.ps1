$deploy = "powershell -NoProfile -WindowStyle Hidden -File C:\Nioxtec\Nioxtec_Facturer\DEVELOPER\scripts\deploy_prod.ps1"
schtasks /Create /TN "Nioxtec Deploy" /SC ONDEMAND /RL HIGHEST /F /TR "$deploy"
Write-Host "Tarea 'Nioxtec Deploy' registrada. Para ejecutar: schtasks /Run /TN 'Nioxtec Deploy'"

