# Standalone Desktop Application - Implementation Plan

## Overview
Convert the ERP from Express/Node.js based to Tauri Desktop Application with embedded SQLite database.

## Current Architecture
```
Web-based ERP
├── Express Backend (Port 3000)
├── SQLite Database (database/bvc.db)
├── React Frontend (Vite, Port 5173)
└── Vite Proxy → Backend
```

## Target Architecture
```
Tauri Desktop App
├── React Frontend (embedded)
├── Rust Backend Commands
├── SQLite Database (embedded)
└── Single .exe Installer
```

---

## Phase 1: Backend Migration (Express → Tauri Commands)

### 1.1 Complete Tauri Database Setup
- [ ] Review and enhance `src-tauri/src/database.rs`
- [ ] Add all missing table schemas
- [ ] Add proper indexes (company_id, item_id, lot_no)
- [ ] Add transaction support (BEGIN/COMMIT/ROLLBACK)

### 1.2 Migrate All Express Routes to Tauri Commands

#### Master Modules:
- [ ] items (Item CRUD + lot generation)
- [ ] item_groups
- [ ] customers
- [ ] suppliers
- [ ] areas
- [ ] cities
- [ ] transports
- [ ] flour_mills
- [ ] papad_companies
- [ ] consignees
- [ ] senders
- [ ] ptrans
- [ ] ledgers
- [ ] ledger_groups
- [ ] weights
- [ ] deduction_sales
- [ ] deduction_purchase
- [ ] companies
- [ ] users

#### Entry Modules:
- [ ] purchases (with lot auto-generation)
- [ ] purchase_items
- [ ] sales (with FIFO lot deduction)
- [ ] sales_items
- [ ] purchase_returns
- [ ] sales_returns
- [ ] flour_out (grind - grain lot reduce, flour lot create)
- [ ] flour_out_returns
- [ ] grains
- [ ] papad_in
- [ ] advances
- [ ] packing
- [ ] weight_conversion
- [ ] open_entries
- [ ] sales_export_orders
- [ ] quotations

#### Reports:
- [ ] stock_status
- [ ] purchase_register
- [ ] sales_register
- [ ] trial_balance
- [ ] ledger_statement
- [ ] day_book
- [ ] profit_loss

#### System:
- [ ] health_check
- [ ] get_db_path
- [ ] execute_query (generic)
- [ ] execute_statement (generic)

---

## Phase 2: Frontend Migration

### 2.1 Create Tauri API Layer
- [ ] Create `frontend/src/utils/tauriApi.js`
- [ ] Implement invoke() wrapper functions
- [ ] Handle error responses
- [ ] Add authentication state management

### 2.2 Update API Configuration
- [ ] Modify `frontend/src/config/api.js` for dual-mode
- [ ] Add environment detection (dev vs production)
- [ ] Configure Vite for Tauri build

### 2.3 Update All Components
- [ ] Replace axios/fetch calls with tauriApi functions
- [ ] Update LoginPage.jsx
- [ ] Update all Master CRUD components
- [ ] Update all Entry components
- [ ] Update all Report components

---

## Phase 3: Database & Configuration

### 3.1 Database Schema
- [ ] Add all missing tables to database.rs
- [ ] Add foreign key constraints
- [ ] Add proper indexes
- [ ] Add stock_lots table with lot tracking
- [ ] Add ledger_entries table

### 3.2 Auto-Initialization
- [ ] Create database on first launch
- [ ] Auto-create schema
- [ ] Seed default data (admin user, default company)

---

## Phase 4: Build Configuration

### 4.1 Tauri Configuration
- [ ] Update tauri.conf.json
- [ ] Configure window settings
- [ ] Set up bundle targets (msi, nsis)
- [ ] Configure security settings

### 4.2 Build Scripts
- [ ] Update package.json scripts
- [ ] Create build_standalone.bat
- [ ] Test production build

---

## Phase 5: Testing & Validation

### 5.1 Module Testing
- [ ] Test all Master CRUD operations
- [ ] Test Purchase with lot auto-generation
- [ ] Test Sales with FIFO lot deduction
- [ ] Test Flour Out (grind) lot flow
- [ ] Test Stock updates
- [ ] Test Ledger entries

### 5.2 Integration Testing
- [ ] Test Purchase → Stock flow
- [ ] Test Stock → Sales flow
- [ ] Test Grind → Flour lot creation
- [ ] Test Lot History tracking

### 5.3 Build Testing
- [ ] Test .exe runs without Node.js
- [ ] Test database auto-creation
- [ ] Test on clean Windows system

---

## File Changes Summary

### Backend Files to Modify:
- `src-tauri/src/database.rs` - Complete schema
- `src-tauri/src/commands.rs` - All commands
- `src-tauri/src/lib.rs` - Command registration
- `src-tauri/tauri.conf.json` - Build config
- `src-tauri/Cargo.toml` - Dependencies

### Frontend Files to Modify:
- `frontend/src/config/api.js` - Dual-mode support
- `frontend/src/utils/tauriApi.js` - New API layer
- `frontend/vite.config.js` - Tauri build config
- All component files using API calls

### Files to Create:
- `frontend/src/utils/tauriApi.js` - Tauri invoke wrapper
- Additional Tauri commands as needed

---

## Acceptance Criteria

1. ✅ Application runs as standalone .exe
2. ✅ No external Node.js required
3. ✅ Database auto-creates on first launch
4. ✅ All CRUD operations work
5. ✅ Lot auto-generation works in Purchase
6. ✅ FIFO lot deduction works in Sales
7. ✅ Flour Out creates flour lots from grain lots
8. ✅ Stock updates correctly
9. ✅ Ledger entries created
10. ✅ No server connection errors

