# BVC Purchase Management System - Distribution

## What's Included:
1. **Desktop Application** (.exe) - Located in `src-tauri/target/release/bvc-purchase-management.exe`
2. **Backend Server** - Located in `backend/` folder
3. **Database** - Located in `database/bvc.db`

## Requirements:
- **Node.js** must be installed on the computer (for backend server)
- Download from: https://nodejs.org

## To Run:
### Option 1: Using the Batch File
1. Double-click `Run_BVC_App.bat`
2. This will start both backend server and open the desktop app

### Option 2: Manual
1. Open terminal in `backend` folder
2. Run: `node server.js`
3. Double-click the .exe file in `src-tauri/target/release/`

## For Distribution to Other Computers:

### Option A - Full Installation Package:
1. Install Node.js on target computer
2. Copy the entire `BVC HTML` folder to target computer
3. Run `Run_BVC_App.bat`

### Option B - Portable (Coming Soon):
- Will include Node.js portable for true standalone operation

## Database Location:
- `database/bvc.db` - Contains all company and user data
- The database is created automatically on first run

## Default Login:
- Username: admin
- Password: admin123

## Troubleshooting:
- If you get "Error connecting to server", make sure Node.js is installed and the backend is running
- Check that port 3000 is not in use by another application
