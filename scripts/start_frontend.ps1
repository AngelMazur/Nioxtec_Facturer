Set-Location "C:\Nioxtec\Nioxtec_Facturer\frontend"

# Asegura que Node.js y npm están en PATH
$env:PATH = "C:\Program Files\nodejs\;C:\Users\angel\AppData\Roaming\npm;$env:PATH"

# Servir archivos estáticos del build en puerto 8080
& "C:\Users\angel\AppData\Roaming\npm\npx.cmd" --yes serve -s dist -l 8080
