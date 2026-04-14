# Full Tauri Integration TODO - Standalone ERP

## Objective
Create a truly standalone .exe ERP application with no external dependencies (no Node.js, no localhost server needed).

## Architecture
```
Tauri App
├── React Frontend (built with Vite)
├── Embedded Node.js Server (Express + SQLite)
└── Packaged into single .exe
```

## Implementation Steps

### Phase 1: Configuration Updates
- [x] 1.1 Analyze current architecture
- [ ] 1.2 Update Tauri configuration for embedded server
- [ ] 1.3 Update Vite config for production build
- [ ] 1.4 Configure database path for AppData

### Phase 2: Backend Modifications
- [ ] 2.1 Update server.js for dynamic port (0 for auto-assign)
- [ ] 2.2 Update database.js for proper AppData path
- [ ] 2.3 Add auto-create database if not exists
- [ ] 2.4 Configure CORS for local Tauri communication

### Phase 3: Frontend Integration
- [ ] 3.1 Ensure all API calls use relative paths
- [ ] 3.2 Update vite.config.js for production
- [ ] 3.3 Test API calls work without proxy

### Phase 4: Build & Package
- [ ] 4.1 Run Tauri build command
- [ ] 4.2 Generate MSI installer
- [ ] 4.3 Test on fresh PC

## Technical Details

### Tauri Config Changes Needed:
- Enable nodejs in Tauri
- Configure proper window size (1200x800 minimum)
- Set app identifier
- Configure devtools for debugging
- Add proper security settings

### Server Changes:
- Change PORT to 0 (dynamic)
- Remove hardcoded database paths
- Add AppData-based database path
- Add auto-initialization if DB doesn't exist

### Frontend Changes:
- Already using relative `/api` paths ✅
- Vite proxy only for dev, not production ✅

## Files to Modify:
1. `src-tauri/tauri.conf.json`
2. `src-tauri/Cargo.toml` (if needed)
3. `backend/server.js`
4. `backend/config/database.js`
5. `frontend/vite.config.js`
