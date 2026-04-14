Get-ChildItem -Path 'Entry/', 'Master/' -Filter '*.html' -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $content = $content -replace '<head>', '<head>`n    <link rel="stylesheet" href="../html-theme.css">'
    Set-Content $_.FullName $content
}
