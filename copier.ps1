$extensions = @('.js', '.ts', '.jsx', '.tsx')

$files = Get-ChildItem -Path "." -Recurse -File | Where-Object {
    ($_.Extension -in $extensions) -and
    ($_.FullName -notmatch '[\\/]node_modules[\\/]') -and
    ($_.FullName -notmatch '[\\/]dist[\\/]') -and
    ($_.Name -ne '.env')
}

$content = foreach ($file in $files) {
    Get-Content $file.FullName -Raw
}

$final = ($content -join " ") -replace "(\r\n|\n|\r|\t)", " "

Set-Clipboard -Value $final

Write-Host "done."
