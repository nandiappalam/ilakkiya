# Lot System Implementation TODO

## Phase 1: Database Indexes
- [x] 1. Add indexes to stock.js for lot_no performance

## Phase 2: Backend APIs
- [x] 2. Add lot history endpoint to stock.js
- [x] 3. Add delete protection to purchases.js

## Phase 3: Frontend - Purchase
- [x] 4. Update PurchaseCreation.jsx - make lot_no read-only

## Phase 4: Frontend - Sales
- [x] 5. Integrate LotDropdown in SalesCreate.jsx (already using lotSelect type)
- [x] 6. Update EntryItemsTable.jsx to handle lot field based on mode

## Phase 5: Testing
- [ ] 7. Test Purchase -> Stock flow
- [ ] 8. Test Stock -> Sales flow (FIFO)
- [ ] 9. Test Purchase -> FlourOut flow

## COMPLETED FEATURES:
✅ Lot Number Auto-Generation on Purchase (format: ITEM-YYYYMMDD-SEQ)
✅ Stock lots tracking with remaining_quantity
✅ FIFO stock deduction on Sales
✅ Lot History API endpoint for traceability
✅ Read-only lot field in Purchase Creation
✅ Lot dropdown in Sales (auto-fetches available lots)
✅ Database indexes for performance
✅ Delete protection for Purchases (prevents deletion if stock used)

