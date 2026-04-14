# BVC ERP - Installation and Build Guide

## Overview
BVC ERP is a complete Purchase Management System that can be installed as a standalone desktop application on any Windows PC without requiring Node.js or any other dependencies.

## Two Options to Run

### Option 1: Development Mode (Requires Node.js)
```
bash
# Install dependencies
npm install
cd frontend && npm install

# Run both backend and frontend
npm run both
# OR run them separately:
npm run start:server  # Terminal 1: Backend at http://localhost:3000
npm run frontend      # Terminal 2: Frontend at http://localhost:5173
```

### Option 2: Standalone Desktop App (No dependencies needed)

#### Prerequisites
- Node.js (for building only)
- Rust (for Tauri)

#### Build Steps
```
bash
# 1. Install all dependencies
npm install
cd frontend && npm install

# 2. Build the frontend
npm run build:frontend

# 3. Build Tauri application (creates .exe)
npm run build:tauri
```

#### Output
The built application will be in:
- `src-tauri/target/release/bundle/msi/` - MSI Installer
- `src-tauri/target/release/bundle/nsis/` - NSIS Installer  
- `src-tauri/target/release/` - Standalone .exe

## Architecture

### Current Architecture (Development)
```
User Browser
    ↓
React Frontend (Vite - Port 5173)
    ↓ (via proxy)
Express Server (Port 3000)
    ↓
SQLite Database (bvc.db)
```

### Standalone Architecture (Production)
```
BVC ERP Desktop App
├── Embedded Express Server
├── React Frontend (built-in)
└── SQLite Database (local file)
```

## Files Structure

```
bvc-erp/
├── backend/                 # Express API Server
│   ├── server.js           # Main server entry
│   ├── config/database.js  # Database configuration
│   └── routes/            # API routes
├── frontend/               # React Frontend
│   ├── src/               # React source
│   └── dist/              # Built frontend
├── database/               # SQLite database
│   └── bvc.db            # Main database file
├── src-tauri/             # Tauri Desktop App
│   ├── src/               # Rust source
│   └── tauri.conf.json    # Tauri configuration
├── Entry/                  # Entry templates
├── Master/                 # Master templates
└── package.json           # Project configuration
```

## Database

### Location
- Development: `./database/bvc.db`
- Production (Tauri): AppData folder

### Auto-Initialization
The database is automatically created on first run with all required tables:
- companies
- users
- customer_master
- supplier_master
- item_master
- item_groups
- ledger groups & ledgers
- And many more...

## Troubleshooting

### Port Already in Use
If port 3000 is already used, the server will automatically use a different port.

### Database Errors
- Ensure the `database/` folder exists
- Check file permissions

### Build Errors
1. Ensure Node.js is installed: `node --version`
2. Ensure Rust is installed: `rustc --version`
3. Clear build cache: `rm -rf src-tauri/target`

## API Endpoints

All APIs are prefixed with `/api`:
- `/api/health` - Health check
- `/api/auth/*` - Authentication
- `/api/companies/*` - Company management
- `/api/masters/*` - Master data CRUD
- `/api/purchases/*` - Purchase entries
- `/api/sales/*` - Sales entries
- `/api/reports/*` - Reports
- And more...

## Configuration

### Changing Database Location
Edit `backend/config/database.js`:
```
javascript
const dbPath = path.join(__dirname, '../../database/bvc.db')
```

### Changing Server Port
Set environment variable:
```
bash
PORT=4000 npm run start:server
```

## Support

For issues or questions, please refer to the project documentation.
