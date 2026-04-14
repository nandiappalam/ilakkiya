# Lot Number Auto-Generation & Module Interconnection Plan

## Database Initialization (Fresh Install Issue)
**Issue:** On fresh PC, server.js creates tables but no sample data (master data like items, suppliers, customers).

**Solution:** Integrate data seeding from `init_db.js` into `server.js` startup.

---

## Backend Implementation Status

### ✅ COMPLETED - Purchase Module
- Lot auto-generation: `ITEMCODE-YYYYMMDD-0001` format
- Inserts into `stock_lots` table  
- Inserts into `stock` table
- Sequential numbering

### ✅ COMPLETED - Sales Module
- FIFO stock deduction
- Validates available stock before sale
- Deducts from `stock_lots.remaining_quantity`
- Negative stock entries for tracking

### ✅ COMPLETED - Stock Module
- `stock_lots` table created
- `GET /lots` - Lot breakdown
- `GET /available-lots` - Available lots for sales
- `GET /available/:itemName` - Available stock for FIFO
- `POST /deduct` - FIFO deduction

### ❌ NEEDS WORK - FlourOut Module (Grind)
- Does NOT link to stock lots
- Does NOT deduct grain lot stock
- Does NOT create flour lot for tracking

---

## Frontend Implementation Status

### ✅ COMPLETED - Purchase Creation
- Auto-generates lot on save (via backend)

### ❌ NEEDS WORK - Sales Entry
- Need lot dropdown showing available lots
- Currently allows manual lot entry

### ❌ NEEDS WORK - FlourOut (Grind) Creation
- Need lot selection for input items
- Need auto-create flour lot for output

---

## Remaining Tasks

### 1. Backend: Enhance FlourOut to Link with Stock Lots
- [ ] Modify flourOut.js to accept lot selection
- [ ] Deduct grain lot stock when grinding
- [ ] Create flour output lot for traceability

### 2. Frontend: Sales Lot Dropdown
- [ ] Add available lots dropdown in SalesEntry.jsx
- [ ] Fetch from `GET /api/stock/available-lots`
- [ ] Show lot, quantity, rate in dropdown

### 3. Frontend: FlourOut Lot Selection
- [ ] Add lot dropdown in FlourOutCreation.jsx
- [ ] Show available grain lots
- [ ] Auto-generate flour output lot

### 4. Database: Add Performance Indexes
- [ ] Add index on stock_lots.lot_no
- [ ] Add index on stock_lots.item_name
- [ ] Add index on stock.item_id

### 5. Database: Seed Data on Fresh Install
- [ ] Integrate sample data seeding into server.js

---

## Implementation Priority

1. **High**: FlourOut lot linking (business critical for manufacturing)
2. **High**: Frontend lot dropdown in Sales
3. **Medium**: Performance indexes
4. **Low**: Fresh install data seeding

---

## API Endpoints Available

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/stock/lots` | GET | Get all lots with quantities |
| `/api/stock/available-lots?item_name=X` | GET | Get lots with qty > 0 |
| `/api/stock/available/:itemName` | GET | Get available stock for item |
| `/api/stock/lot-summary` | GET | Lot-wise stock summary |
| `/api/purchases` | POST | Creates lot on purchase |
| `/api/sales` | POST | Deducts stock via FIFO |
