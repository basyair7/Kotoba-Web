@echo off
setlocal enabledelayedexpansion

REM --- Baca file .env baris per baris ---
for /f "usebackq tokens=1,2 delims==" %%A in (".env") do (
    set "%%A=%%B"
)

REM --- Jalankan deployctl tanpa --prod ---
deployctl deploy --project=kotoba-web --entrypoint=main.ts

endlocal
