$content = Get-Content "frontend/src/components/entry/EntryDisplay.jsx" -Raw
$content = $content -replace 'from "\.\./utils/api"', 'from "../../utils/api"'
Set-Content -Path "frontend/src/components/entry/EntryDisplay.jsx" -Value $content
Write-Host "Fixed import path in EntryDisplay.jsx"

