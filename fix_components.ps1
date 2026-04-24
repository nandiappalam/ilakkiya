$files = Get-ChildItem -Path 'frontend/src/components/*.jsx' -Recurse
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match 'MASTER_CONFIG') {
        # Add safeArray import if missing
        if ($content -notmatch 'safeArray') {
            $content = $content -replace '(import.*MASTER_CONFIG.*;)', "`$1`nimport { safeArray } from '../utils/safeArray.js';"
        }
        # Fix config declaration with fallback
        $content = $content -replace 'const config = MASTER_CONFIG\.(\w+);', 'const config = MASTER_CONFIG.$1 || {};'
        $content = $content -replace 'const config = MASTER_CONFIG\.(\w+) \|\| MASTER_CONFIG\.(\w+);', 'const config = MASTER_CONFIG.$1 || MASTER_CONFIG.$2 || {};'
        # Add sections variable after config line
        if ($content -notmatch 'const sections = safeArray') {
            $content = $content -replace '(const config = .*?\r?\n)', "`$1  const sections = safeArray(config.sections);`n"
        }
        # Replace unsafe patterns
        $content = $content -replace 'config\.sections\.forEach', 'sections.forEach'
        $content = $content -replace 'config\.sections\.map', 'sections.map'
        $content = $content -replace 'section\.fields\.forEach', 'safeArray(section.fields).forEach'
        $content = $content -replace 'section\.fields\.map', 'safeArray(section.fields).map'
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host ('Fixed: ' + $file.Name)
    }
}

