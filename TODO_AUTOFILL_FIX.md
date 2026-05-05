# Supplier Auto-fill Address Fix

**Status: [FULLY IMPLEMENTED]**

**Information Gathered:**
- Backend `/api/masters/suppliers` returns simplified [{id, name}] → no address
- `/api/masters/record/supplier_master/${id}` returns full record with `address1`
- EntryTopFrame.jsx `handleMasterSelect`: `const result = await getMasters(tableName)` → simplified, so `masterRecord.address` undefined
- Backend routes/masters.js line ~230: `getMasters(tableName)` calls same list endpoint
- PurchaseCreate.jsx topFrameFields has supplier/address in col2, but no autofill

**Plan:**
- **frontend/src/components/entry/EntryTopFrame.jsx** (MasterFieldWrapper.handleMasterSelect):
  - Change `await getMasters(tableName)` to `await getMasterRecord(tableName, selectedId)` using `/record/${table}/${id}`
- Add `getMasterRecord` to services/api.js if missing
- Test: Select supplier → address autofills

**Dependent Files:**
- frontend/src/services/api.js or utils/api.js (add getMasterRecord)

**Followup:**
- Backend running
- Refresh, test PurchaseCreate supplier select → address fills
