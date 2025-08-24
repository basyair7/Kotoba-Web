@echo off
setlocal enabledelayedexpansion

REM --- read .env file line by line ---
for /f "usebackq tokens=1,2 delims==" %%A in (".env") do (
    set "%%A=%%B"
)

REM --- run deploy without --prod ---
deployctl deploy --project=kotoba-web --entrypoint=main.ts

endlocal
