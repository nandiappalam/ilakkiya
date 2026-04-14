param(
    [string]$TargetDir = "frontend/src/components",
    [string]$FilePattern = "*.jsx"
)

# Get all JSX files in the target directory
$files = Get-ChildItem -Path $TargetDir -Filter $FilePattern -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw

    # Remove various header divs containing "Inventory Management System" and "A.S. MOORTHY & CO"
    $content = $content -replace '(?s)<!-- HEADER -->\s*<div className="header">\s*<div>Inventory Management System</div>\s*<div>A\.S\. MOORTHY & CO</div>\s*</div>', ''
    $content = $content -replace '(?s)<div className="header">\s*<div>Inventory Management System</div>\s*<div>A\.S\. MOORTHY & CO</div>\s*</div>', ''
    $content = $content -replace '(?s)<div className="top-bar">\s*<div>Inventory Management System</div>\s*<div>A\.S\. MOORTHY & CO</div>\s*</div>', ''
    $content = $content -replace '(?s)<div className="top-bar">\s*<span>Inventory Management System</span><span>A\.S\. MOORTHY &amp; CO</span>\s*</div>', ''
    $content = $content -replace '(?s)<div className="top-bar">\s*Inventory Management System\s*<span.*?>A\.S\. MOORTHY &amp; CO</span>\s*</div>', ''
    $content = $content -replace '(?s)<div className="top-bar">\s*Inventory Management System\s*<span.*?>A\.S\. MOORTHY & CO</span>\s*</div>', ''
    $content = $content -replace '(?s)<div className="top-bar">\s*Inventory Management System\s*</div>', ''
    $content = $content -replace '(?s)<div className="top-bar">\s*<span>Inventory Management System</span>\s*<span.*?>A\.S\. MOORTHY &amp; CO</span>\s*</div>', ''
    $content = $content -replace '(?s)<div className="top-bar">\s*<span>Inventory Management System</span>\s*<span.*?>A\.S\. MOORTHY & CO</span>\s*</div>', ''
    $content = $content -replace '(?s)<div className="header">\s*<span>Inventory Management System</span>\s*<span.*?>A\.S\. MOORTHY &amp; CO</span>\s*</div>', ''
    $content = $content -replace '(?s)<div className="header">\s*<span>Inventory Management System</span>\s*<span.*?>A\.S\. MOORTHY & CO</span>\s*</div>', ''
    $content = $content -replace '(?s)<div className="top-header">\s*<div className="title-bar">Inventory Management System</div>\s*<div.*?>A\.S\. MOORTHY & CO</div>\s*</div>', ''
    $content = $content -replace '(?s)<div className="top-header">\s*Inventory Management System\s*</div>', ''
    $content = $content -replace '(?s)<div className="title-bar">\s*Inventory Management System\s*</div>', ''
    $content = $content -replace '(?s)<div className="system-title">Inventory Management System</div>', ''
    $content = $content -replace '(?s)<div className="top-header">Inventory Management System</div>', ''
    $content = $content -replace '(?s)<div className="title-bar">Inventory Management System</div>', ''

    # Remove any remaining lines with the text
    $content = $content -replace '.*Inventory Management System.*\r?\n?', ''
    $content = $content -replace '.*A\.S\. MOORTHY & CO.*\r?\n?', ''
    $content = $content -replace '.*A\.S\. MOORTHY &amp; CO.*\r?\n?', ''

    # Remove empty header divs
    $content = $content -replace '(?s)<div className="header">\s*</div>', ''
    $content = $content -replace '(?s)<div className="top-bar">\s*</div>', ''
    $content = $content -replace '(?s)<div className="top-header">\s*</div>', ''

    Set-Content -Path $file.FullName -Value $content -NoNewline
    Write-Host "Processed: $($file.FullName)"
}

Write-Host "Header removal completed for JSX files."
