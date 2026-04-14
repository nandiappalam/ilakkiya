# BVC ERP - Master Modules Full Documentation

## Overview
Master modules manage foundational data: Items, Ledgers, Areas, Customers, etc. Each has:
- **Create.jsx**: Add new record
- **Display.jsx**: List view (table)
- **Update.jsx** (some): Edit existing
- Backend: UNIQUE constraints handled (auto-gen codes, INSERT OR IGNORE)

**Workflow**: Navigation → MasterDropdown → Select Module → Display List → Create New → Save (backend validates) → List refreshes.

## Complete List & Fields (from file scan + schema)

### 1. **Item Master** (`item_master`)
**Table**: item_code UNIQUE | item_name | print_name | item_group | type | tax | hsn_code | ed_percent | status
**Pages**:
- **ItemCreate.jsx**: Item Name*, Print Name, Item Group, Type, Tax(%), HSN Code, ED Percent, Status
- **ItemDisplay.jsx**: Table with Item Code, Name, Group, Status
**API**: `createItem(data)`, `getItems()`
**Status**: ✅ FIXED (auto item_code)

### 2. **Area Master** (`area_master`)
**Table**: name UNIQUE | print_name | status
**Pages**:
- **AreaCreate.jsx**: Name*, Print Name, Status
- **AreaDisplay.jsx**: List table
- **AreaUpdate.jsx**: Edit form
**API**: `create_area(data)`

### 3. **City Master** (`city_master`)
**Table**: name UNIQUE | print_name | status
**Pages**:
- **CityCreate.jsx**: Name*, Print Name, Status
- **CityDisplay.jsx**: List
- **CityUpdate.jsx**: Edit
**API**: `create_city(data)`

### 4. **Ledger Master** (`ledgermaster`)
**Table**: name UNIQUE | printname | under | openingbalance | area | credit | debit
**Pages**:
- **LedgerCreate.jsx**: Name*, Print Name, Under (group), Opening Balance, Area, Credit/Debit
- **LedgerDisplay.jsx**: List
**API**: `create_ledger(data)`

### 5. **Ledger Group** (`ledgergroupmaster`)
**Table**: name UNIQUE | printname | under
**Pages**:
- **LedgerGroupCreate.jsx**: Name*, Print Name, Under
- **LedgerGroupDisplay.jsx**: List
**API**: `create_ledger_group(data)`

### 6. **Item Group** (`item_groups`)
**Table**: group_code UNIQUE | group_name | print_name | tax
**Pages**:
- **ItemGroupCreate.jsx**: Group Code, Group Name*, Print Name, Tax
- **ItemGroupDisplay.jsx**: List
**API**: `create_item_group(data)`

### 7. **Flour Mill** (`flour_mill_master`)
**Table**: flourmill UNIQUE | print_name | ... full address/contact
**Pages**:
- **FlourMillCreate.jsx**: Flour Mill*, Print Name, Contact, Address, GST, Wages/kg
- **FlourMillDisplay.jsx**: List
**API**: `create_flour_mill(data)`

### 8. **Papad Company** (`papad_company_master`)
**Table**: name UNIQUE | print_name | ... address/contact/wages
**Pages**:
- **PapadCompanyCreate.jsx**: Name*, Print Name, Contact, Address, Wages/kg
- **PapadCompanyDisplay.jsx**: List
**API**: `create_papad_company(data)`

### 9. **Customer** (`customer_master`)
**Table**: name | print_name | contact_person | address1-4 | GST | phones | area | opening_balance
**Pages**:
- **CustomerCreate.jsx**: Name*, Print Name, Contact, Full Address, GST, Phones, Area, Balance
- **CustomerDisplay.jsx**: List
**API**: `create_customer(data)`

### 10. **Supplier** (`supplier_master`)
**Same as Customer but supplier_master**
- **SupplierCreate.jsx**: Full supplier details
- **SupplierDisplay.jsx**: List
**API**: `create_supplier(data)`

### 11. **Transport** (`transport_master`)
**Table**: name UNIQUE | print_name | status
- **TransportCreate.jsx**: Name*, Print Name, Status
- **TransportDisplay.jsx**: List

### 12. **Weight Master** (`weightmaster`)
**Table**: name UNIQUE | printname | weight
- **WeightCreate.jsx**: Name*, Print Name, Weight
- **WeightDisplay.jsx**: List

### 13. **PTrans** (`ptrans_master`)
**Table**: name UNIQUE | print_name | status
- **PTransCreate.jsx**: Name*, Print Name, Status
- **PTransDisplay.jsx**: List

### 14. **Consignee Group** (`consignee_group_master`)
**Table**: name UNIQUE | print_name | contact | address | area | phones | status
- **ConsigneeCreate.jsx**: Full details
- **ConsigneeDisplay.jsx**: List

### 15. **Sender Group** (`sender_group_master`)
**Same structure as Consignee**
- **SenderCreate.jsx**, **SenderDisplay.jsx**

### 16. **Deduction Sales/Purchase** 
**Tables**: ded_code UNIQUE | ded_name | print_name | adjust/account | type | calc_type | value
- **DeductionSalesCreate.jsx/Display.jsx**
- **DeductionPurchaseCreate.jsx/Display.jsx**

### 17. **Godown** (godown_master - inferred)
- **GodownCreate.jsx**: Name, Location (INSERT OR IGNORE)
- **GodownDisplay.jsx**: List

### 18. **Company** (`companies`)
- **CompanyCreate.jsx**: Name, Address, GST, Contact, Email
- **CompanyDisplay.jsx**: List

## Common Components (./master/)
- **MasterFormLayout**: Form wrapper
- **MasterFieldGroup**: Input field wrapper (text, number, select)
- **MasterActions**: Save/Cancel buttons
- **MasterTableLayout**: Table list with CRUD
- **MasterDropdown**: Module selector

## Backend Mapping (commands.rs)
```
\"items\" → \"item_master\"
\"areas\" → \"area_master\"
\"cities\" → \"city_master\"
etc.
```
Generic `create_master(table, data)` → INSERT OR IGNORE safe.

## Workflow Diagram
```
Navigation → MasterDropdown (select module)
  ↓
Display.jsx (table list)
  ↓ New Button
Create.jsx (form → backend create → refresh list)
  ↓ Edit Button (if Update.jsx exists)
Update.jsx → backend update → refresh
```

**All Masters Now UNIQUE-Safe** ✅ Auto-codes + validation.
**Total: 18+ modules** - Ready for use!"
