@echo off
setlocal enabledelayedexpansion

REM --- read .env file line by line ---
for /f "usebackq tokens=1,2 delims==" %%A in (".env") do (
    set "%%A=%%B"
)

call deno task build

REM --- run deploy with --prod ---
ECHO %DENO_DEPLOY_TOKEN%

REM deno deploy --app=kotoba-web --prod --token=%DENO_DEPLOY_TOKEN%

REM deployctl deploy --prod --token=%DENO_DEPLOY_TOKEN%

REM deployctl deploy --project=kotoba-web --token=%DENO_DEPLOY_TOKEN% --prod

deployctl deploy --project=kotoba-web --prod

endlocal
