# TODO: Login Architecture & Standalone Build

## PART 1: Correct Login Architecture (Username/Password only)

### Step 1: Add login command in commands.rs
- [ ] Add login command that:
  - Takes username and password
  - Finds user by username
  - Verifies password using bcrypt::verify
  - Gets company info from companies table
  - Returns LoginResponse with user_id, username, role, company_id, company_name

### Step 2: Update lib.rs to register login command
- [ ] Add login command to tauri::generate_handler!

### Step 3: Test the login flow
- [ ] Verify login works with bcrypt hashed passwords

## PART 2: Standalone Desktop .exe with Icon

### Step 1: Add app icon
- [ ] Create icons directory in src-tauri/
- [ ] Add icon.ico and icon.png

### Step 2: Update tauri.conf.json
- [ ] Add icon configuration for MSI installer
- [ ] Set bundle targets to msi

### Step 3: Build standalone installer
- [ ] Run npm run tauri build
- [ ] Verify MSI installer is created

## Status:
- The frontend (LoginPage.jsx, AuthContext.jsx, tauriApi.js) is already configured correctly
- The database schema already has company_id in users table
