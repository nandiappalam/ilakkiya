# Tauri Migration Plan: Convert Express Backend to Rust Commands

## Overview
Convert the Express.js backend to Tauri Rust commands for a fully standalone desktop application.

## Current Architecture
- Frontend: React/Vite with HTTP calls to `/api/*`
- Backend: Express.js server on localhost:3000
- Database: SQLite via better-sqlite3

## Target Architecture
- Frontend: React/Vite with Tauri `invoke()` calls
- Backend: Tauri Rust commands
- Database: SQLite via rusqlite

## Migration Steps

### Phase 1: Database Setup
- [ ] Update `src-tauri/src/database.rs` with all required tables
- [ ] Ensure database initialization includes all master tables
- [ ] Test database connectivity

### Phase 2: Core Commands
- [ ] Create purchase-related commands (get_purchases, create_purchase, update_purchase, delete_purchase)
- [ ] Create sales-related commands
- [ ] Create master data commands (customers, suppliers, items, etc.)
- [ ] Create authentication commands
- [ ] Create reporting commands

### Phase 3: Frontend Updates
- [ ] Create Tauri API wrapper functions
- [ ] Update all components to use `invoke()` instead of `fetch()`
- [ ] Update API configuration
- [ ] Test all CRUD operations

### Phase 4: Testing & Deployment
- [ ] Test standalone .exe build
- [ ] Verify database persistence
- [ ] Test all features offline
- [ ] Performance testing

## Database Tables Required
- companies
- users
- financial_years
- city_master
- area_master
- customer_master
- supplier_master
- item_master
- item_groups
- ledgergroupmaster
- ledgermaster
- transport_master
- weightmaster
- ptrans_master
- flour_mill_master
- papad_company_master
- consignee_group_master
- sender_group_master
- deduction_sales
- deduction_purchase
- purchases
- purchase_items
- sales
- sales_items
- stock
- stock_lots

## Commands to Implement
### Authentication
- login
- logout
- get_current_user

### Masters
- get_cities
- create_city
- update_city
- delete_city
- get_customers
- create_customer
- update_customer
- delete_customer
- get_suppliers
- create_supplier
- update_supplier
- delete_supplier
- get_items
- create_item
- update_item
- delete_item
- get_item_groups
- create_item_group
- update_item_group
- delete_item_group
- get_ledgers
- create_ledger
- update_ledger
- delete_ledger
- get_ledger_groups
- create_ledger_group
- update_ledger_group
- delete_ledger_group

### Transactions
- get_purchases
- create_purchase
- update_purchase
- delete_purchase
- get_sales
- create_sale
- update_sale
- delete_sale

### Reports
- get_day_book
- get_trial_balance
- get_balance_sheet
- get_profit_loss
- get_ledger_statement
- get_outstanding_summary
- get_outstanding_details
- get_stock_status
- get_purchase_register
- get_sales_register

### Utilities
- health_check
- get_db_path
- backup_database
- restore_database
