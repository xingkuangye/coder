@echo off
setlocal
set IMAGE=codercom/oss-dogfood:latest
set MAX=10
for /L %%i in (1,1,%MAX%) do (
    echo === Attempt %%i/%MAX% ===
    docker pull %IMAGE%
    if errorlevel 1 (
        echo FAILED, waiting 10s...
        timeout /t 10 /nobreak >nul
    ) else (
        echo SUCCESS
        goto :done
    )
)
:done
endlocal
