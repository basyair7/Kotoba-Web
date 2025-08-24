Get-Content .env | ForEach-Object {
  if ($_ -match "^(?<key>[^=]+)=(?<val>.+)$") {
    [System.Environment]::SetEnvironmentVariable($matches['key'], $matches['val'])
  }
}

deployctl deploy --project=kotoba-web --entrypoint=main.ts
