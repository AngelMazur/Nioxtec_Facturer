Set-Location "C:\Nioxtec\Nioxtec_Facturer"

$env:FLASK_DEBUG  = "false"
$env:ENABLE_TALISMAN = "true"
$env:FORCE_HTTPS  = "true"

# PON un secreto largo y estable (solo ejemplo; cámbialo por uno propio)
$env:JWT_SECRET_KEY = "Rbd4?P5Axi@aS0bhNwN07sptS4&S?R"

$env:CORS_ORIGINS = "https://app.nioxtec.es,http://localhost:5173,http://localhost:8080,http://127.0.0.1:8080"
$env:APP_ORIGIN   = "https://app.nioxtec.es"

& "C:\Nioxtec\Nioxtec_Facturer\.venv310\Scripts\python.exe" "C:\Nioxtec\Nioxtec_Facturer\app.py"
