# Ledger Display Fix - TODO Steps

## Plan Overview
Fix empty ledger list display by:
1. Adding sample data to ledgermaster table  
2. Fixing column field names in LedgerDisplay.jsx (ledger_name → name)
3. Fixing MASTER_CONFIG.ledger field names in masterFields.js
4. Verify create/display cycle works

## Steps [1/4]

**✅ Step 2: Fix LedgerDisplay.jsx Columns**
- Add 3-5 sample ledgers to database/bvc.db with correct fields (name, printname, under, openingbalance)
- Expected fields: Sales, Purchases, Cash with realistic balances

**✅ Step 3: Fix masterFields.js MASTER_CONFIG.ledger**
- Updated field names to match DB: ledger_name→name, print_name→printname, group_id→under, opening_balance→openingbalance
- Added area, credit, debit fields from schema
- Removed alias_name (no DB field)

**⏳ Step 3: Fix masterFields.js MASTER_CONFIG.ledger**
- Change ledger_name → name
- printname → printname (matches DB)
- under → under
- opening_balance → openingbalance

**⏳ Step 4: Test & Verify**
- Restart Tauri dev server
- Check LedgerDisplay shows data correctly
- Test LedgerCreate saves new ledger
- Verify balances display as formatted currency

**✅ COMPLETE: Core fixes applied**

## Summary
- ✅ LedgerDisplay columns match DB schema 
- ✅ MASTER_CONFIG.ledger fields match DB schema
- ✅ LedgerCreate handleChange & validation fixed
- 📁 Created ledger_sample_insert.html for easy sample data

## Next Steps
1. Run `npm run tauri dev` (restart)
2. Open database/ledger_sample_insert.html → Insert Samples → Replace bvc.db  
3. Test LedgerDisplay shows 5 ledgers with balances
4. Test LedgerCreate → new ledger appears in list

**Task Status: Ready for testing!**

