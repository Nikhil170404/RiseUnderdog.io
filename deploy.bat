@echo off
echo Building React application...
npm run build

echo Deploying to Firebase...
firebase deploy

echo Deployment complete!
pause
