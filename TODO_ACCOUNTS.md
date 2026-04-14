# Accounts Module Implementation TODO

## Phase 1: Database Setup
- [ ] 1. Create ledger_entries table in schema.sql
- [ ] 2. Add ledger_entries to database

## Phase 2: Backend API Routes
- [ ] 3. Add accounts API routes (daybook, trial-balance, balance-sheet, profit-loss, ledger, outstanding)
- [ ] 4. Modify purchases.js to auto-create ledger entries
- [ ] 5. Modify sales.js to auto-create ledger entries

## Phase 3: Frontend Components
- [ ] 6. Create DayBookReport.jsx
- [ ] 7. Create TrialBalanceReport.jsx
- [ ] 8. Create BalanceSheetReport.jsx
- [ ] 9. Create ProfitLossReport.jsx
- [ ] 10. Create LedgerStatementReport.jsx
- [ ] 11. Create OutstandingSummaryReport.jsx
- [ ] 12. Create OutstandingDetailsReport.jsx

## Phase 4: Integration
- [ ] 13. Update ReportsIndex.jsx with accounts section
- [ ] 14. Update App.jsx with routes
- [ ] 15. Test and verify

## Financial Logic Reference:
- Purchase → Debit: Purchase Account, Credit: Supplier Ledger
- Sales → Debit: Customer Ledger, Credit: Sales Account
- Payment → Debit: Supplier, Credit: Cash/Bank
- Receipt → Debit: Cash/Bank, Credit: Customer
- Returns → Reverse entries
