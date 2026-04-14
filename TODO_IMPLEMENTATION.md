# ERP Login Architecture & Standalone Build Implementation

## PART 1 - Correct ERP Login Architecture (Username/Password only)

### Step 1: ✅ Add bcrypt to Tauri (Cargo.toml)
- bcrypt = "0.15" - ALREADY ADDED

### Step 2: ✅ Update Users Table (database.rs)
- Users table has company_id column - ALREADY EXISTS

### Step 3: ✅ Hash Password When Creating User (commands.rs)
- create_user command with bcrypt hash - ALREADY IMPLEMENTED

### Step 4: ✅ Create Login Command (commands.rs)
- login command with bcrypt verify - ALREADY IMPLEMENTED
- Returns user_id, username, role, company_id, company_name

### Step 5: Update LoginPage (Frontend)
- Remove company dropdown completely
- Use invoke("login", {username, password})

### Step 6: Update AuthContext
- Handle login response with company data

## PART 2 - Fully Standalone Desktop .exe with Icon

### Step 1: Add App Icon
- Place icon.ico in src-tauri/icons/

### Step 2: Update tauri.conf.json
- Set targets to ["msi"]
- Configure icon paths

### Step 3: Build Installer
- Run: npm run tauri build

## Implementation Status

- [x] bcrypt dependency in Cargo.toml
- [x] company_id in users table
- [x] create_user with password hashing
- [x] login command with bcrypt verify
- [ ] LoginPage.jsx update
- [ ] AuthContext.jsx update
- [ ] tauri.conf.json for MSI
- [ ] App icon setup
- [ ] Build installer

## Files to Modify

1. src-tauri/tauri.conf.json - Add MSI bundle config
2. frontend/src/components/LoginPage.jsx - Remove company dropdown
3. frontend/src/context/AuthContext.jsx - Handle login response
