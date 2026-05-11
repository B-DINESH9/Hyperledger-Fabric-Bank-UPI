@echo off
echo Pushing your current code directly to GitHub's main branch...
cd /d "c:\Users\bdine\Downloads\Block Chain UPI copy\Block Chain UPI copy"
git push origin HEAD:main --force
echo.
echo Process complete! Please check the text above for "resolving deltas... done".
pause
