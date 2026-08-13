$envLine = Get-Content .env.local | Where-Object { $_ -match '^CAPACITOR_SERVER_URL=' } | Select-Object -First 1
if (-not $envLine) { throw 'CAPACITOR_SERVER_URL is missing from .env.local. Add your deployed HTTPS app URL.' }
$env:CAPACITOR_SERVER_URL = $envLine.Substring('CAPACITOR_SERVER_URL='.Length)
