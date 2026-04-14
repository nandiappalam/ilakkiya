Get-ChildItem -Path 'Entry/', 'Master/' -Filter '*.html' -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    # Remove various header divs containing "Inventory Management System" and "A.S. MOORTHY & CO"
    $content = $content -replace '(?s)<!-- Top Title Bar -->\s*<div class="title-bar">\s*Inventory Management System\s*<span class="company">A\.S\. MOORTHY & CO</span>\s*</div>', ''
    $content = $content -replace '(?s)<div class="top-bar">\s*Inventory Management System\s*<span.*?>A\.S\. MOORTHY & CO</span>\s*</div>', ''
    $content = $content -replace '(?s)<div class="title-bar">\s*<div>Inventory Management System</div>\s*<div>A\.S\. MOORTHY & CO</div>\s*</div>', ''
    $content = $content -replace '(?s)<div class="top-bar">\s*<div>Inventory Management System</div>\s*<div>A\.S\. MOORTHY & CO</div>\s*</div>', ''
    $content = $content -replace '(?s)<div class="top-header">\s*Inventory Management System\s*<span class="company">A\.S\. MOORTHY & CO</span>\s*</div>', ''
    $content = $content -replace '(?s)<div class="header">\s*<div>Inventory Management System</div>\s*<div>A\.S\. MOORTHY & CO</div>\s*</div>', ''
    $content = $content -replace '(?s)<div class="header">\s*Inventory Management System\s*<span.*?>A\.S\. MOORTHY & CO</span>\s*</div>', ''
    $content = $content -replace '(?s)<div class="app-header">\s*<div>Inventory Management System</div>\s*<div>A\.S\. MOORTHY & CO</div>\s*</div>', ''
    $content = $content -replace '(?s)<div class="system-title">Inventory Management System</div>', ''
    $content = $content -replace '(?s)<div class="top-header">Inventory Management System</div>', ''
    $content = $content -replace '(?s)<div class="title-bar">Inventory Management System</div>', ''
    # Remove any remaining lines with the text
    $content = $content -replace '.*Inventory Management System.*\r?\n?', ''
    $content = $content -replace '.*A\.S\. MOORTHY & CO.*\r?\n?', ''
    # Remove empty divs
    $content = $content -replace '<div class="[^"]*">\s*</div>', ''
    Set-Content $_.FullName $content
}
