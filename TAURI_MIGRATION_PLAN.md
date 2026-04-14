# Tauri Full Migration Plan - ERP Desktop Application

## Current Project State Analysis

### ✅ Already Completed:
1. **Tauri Backend (Rust)** - Core commands implemented:
   - execute_query, execute_statement (generic SQL)
   - Purchase CRUD (get_purchases, create_purchase, update_purchase, delete_purchase)
   - Sales CRUD (get_sales, create_sale, update_sale, delete_sale)
   - Customer CRUD (get_customers, create_customer, update_customer, delete_customer)
   - Supplier CRUD (get_suppliers, create_supplier, update_supplier, delete_supplier)
   - Item CRUD (get_items, create_item, update_item, delete_item)
   - Auth (login, create_user)
   - SQLite database setup with proper AppData path

2. **Frontend Tauri API** - tauriApi.js has wrapper functions for all above commands

3. **Partially Converted Components**:
   - CustomerDisplay.jsx ✅
   - CustomerCreate.jsx ✅
   - SupplierDisplay.jsx (needs verification)
   - SupplierCreate.jsx (needs verification)
   - ItemDisplay.jsx (needs verification)
   - ItemCreate.jsx (needs verification)

### ❌ Still Using Axios (~89+ API calls):
- TransportDisplay.jsx, TransportCreate.jsx
- AreaDisplay.jsx, AreaCreate.jsx
- CityDisplay.jsx, CityCreate.jsx
- LedgerDisplay.jsx, LedgerCreate.jsx
- LedgerGroupDisplay.jsx, LedgerGroupCreate.jsx
- FlourMillDisplay.jsx, FlourMillCreate.jsx
- ConsigneeDisplay.jsx, ConsigneeCreate.jsx
- PTransDisplay.jsx, PTransCreate.jsx
- PapadCompanyDisplay.jsx, PapadCompanyCreate.jsx
- SenderDisplay.jsx, SenderCreate.jsx
- WeightDisplay.jsx, WeightCreate.jsx
- DeductionSalesDisplay.jsx, DeductionSalesCreate.jsx
- DeductionPurchaseDisplay.jsx, DeductionPurchaseCreate.jsx
- All Entry modules (Sales, Purchase, Advance, FlourOut, etc.)
- All Report modules
- And many more...

---

## Migration Strategy

### Phase 1: Complete Backend Commands (Rust)
Add all missing Tauri commands in src-tauri/src/commands.rs:

| Module | Commands Needed |
|--------|-----------------|
| Areas | get_areas, create_area, update_area, delete_area |
| Cities | get_cities, create_city, update_city, delete_city |
| Ledgers | get_ledgers, create_ledger, update_ledger, delete_ledger |
| LedgerGroups | get_ledger_groups, create_ledger_group, update_ledger_group, delete_ledger_group |
| FlourMills | get_flour_mills, create_flour_mill, update_flour_mill, delete_flour_mill |
| Consignees | get_consignees, create_consignee, update_consignee, delete_consignee |
| PTrans | get_ptrans, create_ptrans, update_ptrans, delete_ptrans |
| PapadCompanies | get_papad_companies, create_papad_company, update_papad_company, delete_papad_company |
| Senders | get_senders, create_sender, update_sender, delete_sender |
| Weights | get_weights, create_weight, delete_weight |
| DeductionSales | get_deduction_sales, create_deduction_sales, update_deduction_sales, delete_deduction_sales |
| DeductionPurchase | get_deduction_purchase, create_deduction_purchase, update_deduction_purchase, delete_deduction_purchase |
| ItemGroups | get_item_groups, create_item_group, update_item_group, delete_item_group |
| Transport | get_transports, create_transport, update_transport, delete_transport |
| Advances | get_advances, create_advance, update_advance, delete_advance |
| FlourOut | get_flour_out, create_flour_out, update_flour_out, delete_flour_out |
| FlourOutReturn | get_flour_out_return, create_flour_out_return, update_flour_out_return, delete_flour_out_return |
| SalesReturn | get_sales_returns, create_sales_return, update_sales_return, delete_sales_return |
| PurchaseReturn | get_purchase_returns, create_purchase_return, update_purchase_return, delete_purchase_return |
| SalesExport | get_sales_export, create_sales_export, update_sales_export, delete_sales_export |
| SalesExportOrder | get_sales_export_order, create_sales_export_order, update_sales_export_order, delete_sales_export_order |
| Open | get_open, create_open, update_open, delete_open |
| Packing | get_packing, create_packing, update_packing, delete_packing |
| PapadIn | get_papad_in, create_papad_in, update_papad_in, delete_papad_in |
| Grind | get_grind, create_grind, update_grind, delete_grind |
| Quotation | get_quotations, create_quotation, update_quotation, delete_quotation |
| StockAdjust | get_stock_adjust, create_stock_adjust, update_stock_adjust, delete_stock_adjust |
| WeightConversion | get_weight_conversion, create_weight_conversion, update_weight_conversion, delete_weight_conversion |
| Grains | get_grains, create_grains, update_grains, delete_grains |
| Stock | get_stock, get_available_lots, update_stock |
| Reports | All report generation commands |
| Companies | get_companies, create_company, update_company, delete_company |
| Users | get_users, update_user, delete_user |
| FinancialYears | get_financial_years, create_financial_year, update_financial_year |

### Phase 2: Extend tauriApi.js
Add all wrapper functions for new commands

### Phase 3: Convert Components (Module by Module)

**Module 1: Master - Display Pages (~15 components)**
- TransportDisplay.jsx
- AreaDisplay.jsx
- CityDisplay.jsx
- LedgerDisplay.jsx
- LedgerGroupDisplay.jsx
- FlourMillDisplay.jsx
- ConsigneeDisplay.jsx
- PTransDisplay.jsx
- PapadCompanyDisplay.jsx
- SenderDisplay.jsx
- WeightDisplay.jsx
- DeductionSalesDisplay.jsx
- DeductionPurchaseDisplay.jsx
- ItemGroupDisplay.jsx

**Module 2: Master - Create Pages (~15 components)**
- TransportCreate.jsx
- AreaCreate.jsx
- CityCreate.jsx
- LedgerCreate.jsx
- LedgerGroupCreate.jsx
- FlourMillCreate.jsx
- ConsigneeCreate.jsx
- PTransCreate.jsx
- PapadCompanyCreate.jsx
- SenderCreate.jsx
- WeightCreate.jsx
- DeductionSalesCreate.jsx
- DeductionPurchaseCreate.jsx
- ItemGroupCreate.jsx

**Module 3: Entry - Creation Pages**
- SalesCreate.jsx / SalesEntry.jsx
- PurchaseCreate.jsx / PurchaseCreation.jsx
- AdvanceCreate.jsx / AdvanceEntry.jsx
- FlourOutCreation.jsx
- FlourOutReturnCreation.jsx
- SalesReturnCreate.jsx
- PurchaseReturn.jsx
- SalesExportCreate.jsx
- SalesExportOrderCreate.jsx
- OpenCreate.jsx
- PackingCreate.jsx
- PapadInCreate.jsx
- GrainsCreation.jsx
- QuotationCreate.jsx
- StockAdjustCreate.jsx
- WeightConversionCreate.jsx

**Module 4: Entry - Display Pages**
- SalesDisplayPage.jsx
- PurchaseDisplay.jsx
- AdvanceDisplay.jsx
- FlourOutDisplay.jsx
- FlourOutReturnDisplay.jsx
- SalesReturnDisplay.jsx
- PurchaseReturnDisplay.jsx
- SalesExportDisplay.jsx
- GrainsDisplay.jsx
- PapadInDisplay.jsx
- QuotationDisplay.jsx
- WeightConversionDisplay.jsx

**Module 5: Reports**
- All files in src/components/Reports/

**Module 6: Dropdowns**
- MasterDropdown.jsx
- LotDropdown.jsx

**Module 7: Other**
- StockReport.jsx
- ReportPage.jsx

### Phase 4: Remove Express Dependencies
- Remove backend folder (or keep for reference)
- Update package.json to remove express, axios (keep axios for non-Tauri fallback)
- Update vite.config.js to remove API proxy

---

## Conversion Pattern

**Before (axios):**
```
javascript
import axios from 'axios'

const response = await axios.get('/api/masters/transport_master')
setTransports(response.data)

await axios.delete(`/api/masters/transport_master/${transport.id}`)
```

**After (Tauri invoke):**
```
javascript
import { getTransports, deleteTransport } from '../utils/tauriApi'

const result = await getTransports()
if (result.success) {
  setTransports(result.data)
}

await deleteTransport(transport.id)
```

---

## Estimated Work

| Phase | Tasks | Estimated Time |
|-------|-------|-----------------|
| Phase 1 | Add 50+ Rust commands | 4-6 hours |
| Phase 2 | Extend tauriApi.js | 1-2 hours |
| Phase 3 | Convert ~60 components | 8-10 hours |
| Phase 4 | Cleanup & Testing | 2-3 hours |
| **Total** | | **15-21 hours** |

---

## Implementation Order

1. **First**: Convert all Master Display pages (most used, highest impact)
2. **Second**: Convert all Master Create pages
3. **Third**: Convert Entry pages (by popularity)
4. **Fourth**: Convert Reports
5. **Fifth**: Convert remaining utilities/dropdowns

---

## Risk Mitigation

- Use generic `executeQuery` and `executeStatement` as fallback for any missing commands
- Keep axios as optional fallback for development
- Test each component conversion before moving to next
- Use console.log debugging during conversion
