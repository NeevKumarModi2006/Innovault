@echo off
echo Initializing Git Repository...
git init
git add .
git commit -m "Initial commit for Innovault"
git branch -M main
git remote add origin https://github.com/NeevKumarModi2006/Innnovault.git
echo Pushing to GitHub...
git push -u origin main
pause
