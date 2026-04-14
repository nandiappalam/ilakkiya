# Full Tauri Conversion Task List

## ✅ Already Implemented (Backend - Rust)

### Core Commands
- [x] execute_query
- [x] execute_statement
- [x] health_check
- [x] get_db_path

### Auth
- [x] login
- [x] create_user

### Companies
- [x] get_companies
- [x] create_company

### Master Data - CRUD
- [x] Customers (get, create, update, delete)
- [x] Suppliers (get, create, update, delete)
- [x] Items (get, create, update, delete)
- [x] Areas (get, create, update, delete)
- [x] Cities (get, create, update, delete)
- [x] Transport (get, create, delete)
- [x] Flour Mills (get, create, delete)
- [x] Consignees (get, create, delete)
- [x] PTrans (get, create, delete)
- [x] Papad Companies (get, create, delete)
- [x] Senders (get, create, delete)
- [x] Weights (get, create, delete)
- [x] Ledgers (get, create, update, delete)
- [x] Ledger Groups (get, create, delete)
- [x] Item Groups (get, create, delete)
- [x] Deduction Sales (get, create, delete)
- [x] Deduction Purchase (get, create, delete)

### Transactions
- [x] Purchases (get, create, update, delete)
- [x] Sales (get, create, update, delete)

### Stock
- [x] get_stock
- [x] get_available_lots

---

## ✅ Already Implemented (Frontend API - tauriApi.js)

All the above commands have wrapper functions in tauriApi.js

---

## ❌ Components Still Using Axios (Need Conversion)

### Master Display Components
- [ ] TransportDisplay.jsx
- [ ] AreaDisplay.jsx
- [ ] CityDisplay.jsx
- [ ] LedgerDisplay.jsx
- [ ] LedgerGroupDisplay.jsx
- [ ] FlourMillDisplay.jsx
- [ ] ConsigneeDisplay.jsx
- [ ] PTransDisplay.jsx
- [ ] PapadCompanyDisplay.jsx
- [ ] SenderDisplay.jsx
- [ ] WeightDisplay.jsx
- [ ] DeductionSalesDisplay.jsx
- [ ] DeductionPurchaseDisplay.jsx
- [ ] ItemGroupDisplay.jsx

### Master Create Components
- [ ] TransportCreate.jsx
- [ ] AreaCreate.jsx
- [ ] CityCreate.jsx
- [ ] LedgerCreate.jsx
- [ ] LedgerGroupCreate.jsx
- [ ] FlourMillCreate.jsx
- [ ] ConsigneeCreate.jsx
- [ ] PTransCreate.jsx
- [ ] PapadCompanyCreate.jsx
- [ ] SenderCreate.jsx
- [ ] WeightCreate.jsx
- [ ] DeductionSalesCreate.jsx
- [ ] DeductionPurchaseCreate.jsx
- [ ] ItemGroupCreate.jsx

### Master Update Components
- [ ] SupplierUpdate.jsx
- [ ] AreaUpdate.jsx
- [ ] CityUpdate.jsx
- [ ] PTransUpdate.jsx

### Entry Components (Various)
- [ ] SalesEntry.jsx
- [ ] PurchaseCreation.jsx
- [ ] AdvanceCreate.jsx
- [ ] AdvanceEntry.jsx
- [ ] FlourOutCreation.jsx
- [ ] FlourOutReturnCreation.jsx
- [ ] SalesReturnCreate.jsx
- [ ] PurchaseReturn.jsx
- [ ] SalesExportCreate.jsx
- [ ] SalesExportOrderCreate.jsx
- [ ] OpenCreate.jsx
- [ ] PackingCreate.jsx
- [ ] PapadInCreate.jsx
- [ ] GrainsCreation.jsx
- [ ] QuotationCreate.jsx
- [ ] StockAdjustCreate.jsx
- [ ] WeightConversionCreate.jsx

### Entry Display Components
- [ ] SalesDisplayPage.jsx
- [ ] PurchaseDisplay.jsx
- [ ] AdvanceDisplay.jsx
- [ ] FlourOutDisplay.jsx
- [ ] FlourOutReturnDisplay.jsx
- [ ] SalesReturnDisplay.jsx
- [ ] PurchaseReturnDisplay.jsx
- [ ] SalesExportDisplay.jsx
- [ ] GrainsDisplay.jsx
- [ ] PapadInDisplay.jsx
- [ ] QuotationDisplay.jsx
- [ ] WeightConversionDisplay.jsx
- [ ] GrindDisplay.jsx

### Report Components
- [ ] All files in src/components/Reports/

### Utility Components
- [ ] MasterDropdown.jsx
- [ ] LotDropdown.jsx
- [ ] StockReport.jsx

---

## 🔧 Missing Backend Commands (Need to Add)

### Entry Modules
- [ ] Advances (get, create, update, delete)
- [ ] Flour Out (get, create, update, delete)
- [ ] Flour Out Return (get, create, update, delete)
- [ ] Sales Return (get, create, update, delete)
- [ ] Purchase Return (get, create, update, delete)
- [ ] Sales Export (get, create, update, delete)
- [ ] Sales Export Order (get, create, update, delete)
- [ ] Open (get, create, update, delete)
- [ ] Packing (get, create, update, delete)
- [ ] Papad In (get, create, update, delete)
- [ ] Grind (get, create, update, delete)
- [ ] Quotation (get, create, update, delete)
- [ ] Stock Adjust (get, create, update, delete)
- [ ] Weight Conversion (get, create, update, delete)
- [ ] Grains (get, create, update, delete)

### Reports
- [ ] Day Book Report
- [ ] Trial Balance Report
- [ ] Balance Sheet Report
- [ ] Profit & Loss Report
- [ ] Ledger Statement Report
- [ ] Outstanding Summary Report
- [ ] Outstanding Details Report
- [ ] Stock Status Report
- [ ] Purchase Register Report
- [ ] Sales Register Report
- [ ] Purchase Return Register Report
- [ ] Sales Return Register Report
- [ ] Papad Ledger Report

### Other
- [ ] Users (get, update, delete)
- [ ] Financial Years (get, create, update)

---

## 📋 Conversion Pattern

### Before (Axios):
```
javascript
import axios from 'axios'
const response = await axios.get('/api/masters/transport_master')
setTransports(response.data)
await axios.delete(`/api/masters/transport_master/${transport.id}`)
```

### After (Tauri):
```
javascript
import { getTransports, deleteTransport } from '../utils/tauriApi'
const result = await getTransports()
if (result.success) setTransports(result.data)
await deleteTransport(transport.id)
```

---

## 🚀 Priority Order

1. **Priority 1**: Master Display pages (most frequently used)
2. **Priority 2**: Master Create pages
3. **Priority 3**: Entry Creation pages
4. **Priority 4**: Entry Display pages
5. **Priority 5**: Reports
6. **Priority 6**: Utilities/Dropdowns
7. **Priority 7**: Add missing backend commands
