# ERP Full Module Testing - TODO List

## Testing Progress

### Phase 1: Health Check
- [x] Test file created: `backend/erp_full_validation_test.js`
- [ ] Run health check
- [ ] Verify API is accessible

### Phase 2: Master Module Testing
- [ ] City Master CRUD
- [ ] Area Master CRUD
- [ ] Supplier Master CRUD
- [ ] Customer Master CRUD
- [ ] Item Master CRUD
- [ ] Item Group CRUD
- [ ] Ledger Master CRUD
- [ ] Ledger Group CRUD

### Phase 3: Purchase Module Testing
- [ ] Create purchase with multiple items
- [ ] Verify lot auto-generation
- [ ] Verify stock_lots table insertion
- [ ] Verify ledger entries created
- [ ] Test purchase deletion (before sale)

### Phase 4: Sales Module Testing
- [ ] Setup stock via purchase
- [ ] Test oversell prevention (negative stock prevention)
- [ ] Test valid sale creation
- [ ] Verify FIFO deduction working
- [ ] Test partial sale
- [ ] Test purchase deletion after partial sale (should block)

### Phase 5: Stock & Lot Integrity
- [ ] Check for negative stock quantities
- [ ] Check for duplicate lot numbers
- [ ] Verify stock report accuracy

### Phase 6: Ledger & Accounts
- [ ] Test Trial Balance (Debit = Credit)
- [ ] Test Daybook
- [ ] Test Ledger Statement
- [ ] Test Outstanding Summary

### Phase 7: Reports
- [ ] Stock Status Report
- [ ] Purchase Register
- [ ] Sales Register
- [ ] Purchase Return Register
- [ ] Sales Return Register
- [ ] Papad Ledger
- [ ] Balance Sheet
- [ ] Profit & Loss

### Phase 8: Edge Cases
- [ ] Missing required fields validation
- [ ] Zero quantity validation
- [ ] Negative rate validation

### Phase 9: Flour Out (Grind) Module
- [ ] Verify API accessibility

### Phase 10: Auth & User Testing
- [ ] Companies API
- [ ] Auth API

## Validation Checklist

### Production Readiness Requirements
- [ ] No negative stock quantities
- [ ] No ledger mismatch (Debit = Credit)
- [ ] No duplicate lot numbers
- [ ] No API 400/500 errors
- [ ] Required field validations working
- [ ] Delete restrictions working
- [ ] FIFO stock deduction working
- [ ] Stock integrity verified

## Test Execution
```bash
# Run the full validation test
cd backend
node erp_full_validation_test.js

# Alternative: Run existing tests
node full_system_test.js
node test_lot_flow.js
```

## Expected Output
- All phases passing
- Zero failures
- Zero warnings (ideally)

