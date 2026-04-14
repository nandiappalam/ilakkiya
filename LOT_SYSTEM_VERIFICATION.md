# Lot System & Stock Ledger Verification

## Phase 1: Backend Code Analysis

### 1.1 Purchase Route - Lot Auto-Generation
**File:** `backend/routes/purchases.js`

Check:
- [ ] Auto-generates lot number in format: `ITEMCODE-YYYYMMDD-SEQ`
- [ ] Stores in `purchase_items` table
- [ ] Creates `stock_lots` entry
- [ ] Updates `stock` table

### 1.2 Sales Route - Lot FIFO Deduction  
**File:** `backend/routes/sales.js`

Check:
- [ ] Fetches available lots from `stock_lots`
- [ ] Deducts quantity using FIFO (oldest first)
- [ ] Updates `remaining_quantity` in stock_lots
- [ ] Creates negative entry in stock table

### 1.3 FlourOut Route - Lot Conversion
**File:** `backend/routes/flourOut.js`

Check:
- [ ] Reduces grain lot quantity
- [ ] Creates new flour lot
- [ ] Links grain lot to flour lot
- [ ] Updates stock table correctly

### 1.4 Stock Route - Lot Tracking
**File:** `backend/routes/stock.js`

Check:
- [ ] Provides available lots API
- [ ] Shows remaining quantity per lot
- [ ] Supports lot history

---

## Phase 2: Database Schema Verification

### Required Tables:
```sql
-- Stock Lots Table (for lot tracking)
CREATE TABLE stock_lots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id INTEGER,
  item_name TEXT NOT NULL,
  lot_no TEXT NOT NULL,
  purchase_id INTEGER,
  quantity REAL DEFAULT 0,
  remaining_quantity REAL DEFAULT 0,
  rate REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Stock Table (transaction history)
CREATE TABLE stock (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT,
  item_id INTEGER,
  item_name TEXT,
  lot_no TEXT,
  qty REAL DEFAULT 0,
  weight REAL DEFAULT 0,
  rate REAL DEFAULT 0,
  amount REAL DEFAULT 0,
  type TEXT, -- Purchase, Sale, Grind, Flour Out, etc.
  reference_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Ledger Entries Table
CREATE TABLE ledger_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT,
  voucher_no TEXT,
  ledger_name TEXT,
  debit REAL DEFAULT 0,
  credit REAL DEFAULT 0,
  company_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Required Indexes:
```sql
CREATE INDEX idx_stock_lot ON stock_lots(lot_no);
CREATE INDEX idx_stock_item ON stock_lots(item_name);
CREATE INDEX idx_stock_date ON stock(date);
CREATE INDEX idx_ledger_company ON ledger_entries(company_id);
```

---

## Phase 3: Manual Test Scenarios

### Test 1: Purchase → Stock
```
1. Create Purchase: 100kg of Urad
2. Check stock_lots: Should have 1 lot with qty=100, remaining=100
3. Check stock table: Should have 1 entry with qty=100
4. Lot number format: URA-YYYYMMDD-0001
```

### Test 2: Sales → Lot Deduction
```
1. Create Sales: 30kg of Urad (select lot)
2. Check stock_lots: remaining should be 70
3. Check stock table: Should have negative entry -30kg
4. Verify: Cannot sell more than available
```

### Test 3: Flour Out (Grind)
```
1. Create Flour Out: 50kg Urad → Flour
2. Check grain lot: remaining reduced by 50
3. Check flour lot: new lot created with 50kg
4. Check stock: Two entries (grain out, flour in)
```

### Test 4: Multi-Lot Sales (FIFO)
```
1. Purchase 50kg → Lot A
2. Purchase 50kg → Lot B  
3. Sell 80kg
4. Should deduct: Lot A (50) + Lot B (30) = 80
5. Lot A remaining: 0
6. Lot B remaining: 20
```

---

## Phase 4: Ledger Integrity Test

### Test Command:
```sql
SELECT 
  SUM(debit) as total_debit, 
  SUM(credit) as total_credit 
FROM ledger_entries;
```

**Expected:** total_debit = total_credit

### Common Issues:
- ❌ Missing ledger entries on delete
- ❌ Wrong debit/credit calculation
- ❌ Company filter not applied
- ❌ Round-off errors

---

## Phase 5: Frontend Component Check

### PurchaseCreation.jsx
- [ ] Shows lot number field (auto-generated, read-only)
- [ ] Sends lot_no to backend

### SalesCreate.jsx  
- [ ] Lot dropdown shows available lots
- [ ] Shows remaining quantity per lot
- [ ] Hides lots with 0 quantity

### FlourOutCreation.jsx
- [ ] Select grain lot
- [ ] Auto-create flour lot
- [ ] Shows lot traceability

---

## Phase 6: Bug Fixes Required

### Issue: Delete Purchase with Lot Used
```
Problem: Can delete purchase even if lot partially sold
Solution: Check stock_lots.remaining_quantity before delete
```

### Issue: Lot Number Duplication
```
Problem: Same lot number generated twice
Solution: Use transaction + unique constraint
```

### Issue: Negative Stock
```
Problem: Can sell more than available
Solution: Add check before sales save
```

---

## Verification Checklist

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Lot auto-generates on Purchase | ⬜ | |
| 2 | Lot stored in stock table | ⬜ | |
| 3 | Lot shows in Sales dropdown | ⬜ | |
| 4 | Lot quantity reduces on Sale | ⬜ | |
| 5 | FIFO deduction works | ⬜ | |
| 6 | Grind reduces grain lot | ⬜ | |
| 7 | Flour Out creates flour lot | ⬜ | |
| 8 | Cannot oversell lot | ⬜ | |
| 9 | Cannot delete used purchase | ⬜ | |
| 10 | Ledger Debit = Credit | ⬜ | |
| 11 | Trial Balance balanced | ⬜ | |

---

## Next Steps

1. Run Phase 3 tests manually
2. Fix any failing scenarios
3. Verify Ledger balance
4. Document all business logic
5. THEN start Tauri migration

