# ERP Master Integration & Lot-wise Stock System - Task List

## Completed ✅
- [x] Database schema fixes - Added status columns to all master tables
- [x] Backend reports API endpoints (reports.js)
- [x] Reports Index page
- [x] Stock Status Report page  
- [x] Purchase Register Report page
- [x] Sales Register Report page
- [x] Purchase Return Register Report page
- [x] Sales Return Register Report page
- [x] Papad Ledger Report page
- [x] MasterDropdown reusable component
- [x] Updated App.jsx with report routes
- [x] Added sample data for testing

## In Progress 🔄
- [ ] Create stock_lots table for FIFO tracking
- [ ] Implement auto lot number generation in Purchase
- [ ] Implement FIFO deduction in Sales
- [ ] Integrate MasterDropdown in Entry pages

## Pending 📋
- [ ] Create Stock Report page (Entry → Stock Report)
- [ ] UI standardization - Blue & White theme
- [ ] Test all functionality
- [ ] Fix any issues found

## Master → Entry Dropdown Integration
The following Entry pages need MasterDropdown:
- [ ] SalesCreate.jsx - Customer, Item dropdowns
- [ ] PurchaseCreate.jsx - Supplier, Item dropdowns
- [ ] AdvanceCreate.jsx - Papad Company dropdown
- [ ] Other entry pages...

## Stock System Components Needed
- [ ] stock_lots table (id, item_id, lot_no, purchase_id, quantity, remaining_quantity, rate, created_at)
- [ ] sales_items update (add lot tracking)
- [ ] Stock Report page with Product Summary and Lot Breakdown modes

## UI Theme Requirements
- Primary Blue: #1976d2
- Dark Blue: #0d47a1  
- White Background
- Same input height, border radius, spacing
- Blue focus border
- Clean card layout
