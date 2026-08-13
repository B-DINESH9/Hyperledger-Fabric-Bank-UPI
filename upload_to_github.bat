@echo off
echo Adding changes...
git add .
echo Committing changes...
git commit -m "Update code"
echo Pushing to GitHub...
git push origin HEAD
echo.
echo Done! If you see any errors above, take a screenshot. Otherwise, it uploaded successfully!
pause
