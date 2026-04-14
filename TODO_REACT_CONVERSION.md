# React Component Refactoring - Using Modular Components

## Task
Refactor existing page components to USE the reusable entry/master components that already exist.

## Current Status

### Already Built Reusable Components:
1. **Entry Components:**
   - `EntryTopFrame` - 3-column form layout
   - `EntryItemsTable` - Items table
   - `EntryTotalsRow` - Totals row
   - `EntryBottomSummary` - Bottom summary
   - `EntrySection` - Section wrapper
   - `EntryActions` - Action buttons

2. **Master Components:**
   - `MasterFormLayout` - 2-column form grid
   - `MasterFieldGroup` - Field group wrapper
   - `MasterTableLayout` - Table layout
   - `MasterActions` - Action buttons

### Pages to Refactor:

## Entry Pages:
- [ ] SalesCreate.jsx - Use EntryTopFrame, EntryItemsTable, EntryTotalsRow, EntryActions
- [ ] PurchaseCreate.jsx - Use EntryTopFrame, EntryItemsTable, EntryTotalsRow, EntryActions
- [ ] AdvanceCreate.jsx - Use EntryTopFrame, EntryItemsTable, EntryTotalsRow, EntryActions
- [ ] SalesReturnCreate.jsx - Use EntryTopFrame, EntryItemsTable, EntryTotalsRow, EntryActions
- [ ] FlourOutCreation.jsx - Use EntryTopFrame, EntryItemsTable, EntryTotalsRow, EntryActions
- [ ] FlourOutReturnCreation.jsx - Use EntryTopFrame, EntryItemsTable, EntryTotalsRow, EntryActions
- [ ] PackingCreate.jsx - Use EntryTopFrame, EntryItemsTable, EntryTotalsRow, EntryActions
- [ ] GrainsCreation.jsx - Use EntryTopFrame, EntryItemsTable, EntryTotalsRow, EntryActions
- [ ] QuotationCreate.jsx - Use EntryTopFrame, EntryItemsTable, EntryTotalsRow, EntryActions

## Master Pages:
- [ ] SupplierCreate.jsx - Use MasterFormLayout, MasterFieldGroup, MasterActions
- [ ] CustomerCreate.jsx - Use MasterFormLayout, MasterFieldGroup, MasterActions
- [ ] CityCreate.jsx - Use MasterFormLayout, MasterFieldGroup, MasterActions
- [ ] AreaCreate.jsx - Use MasterFormLayout, MasterFieldGroup, MasterActions
- [ ] ItemCreate.jsx - Use MasterFormLayout, MasterFieldGroup, MasterActions
- [ ] LedgerCreate.jsx - Use MasterFormLayout, MasterFieldGroup, MasterActions
- [ ] ItemGroupCreate.jsx - Use MasterFormLayout, MasterFieldGroup, MasterActions
- [ ] LedgerGroupCreate.jsx - Use MasterFormLayout, MasterFieldGroup, MasterActions
- [ ] FlourMillCreate.jsx - Use MasterFormLayout, MasterFieldGroup, MasterActions
- [ ] PTransCreate.jsx - Use MasterFormLayout, MasterFieldGroup, MasterActions
- [ ] ConsigneeCreate.jsx - Use MasterFormLayout, MasterFieldGroup, MasterActions
- [ ] SenderCreate.jsx - Use MasterFormLayout, MasterFieldGroup, MasterActions
- [ ] PapadCompanyCreate.jsx - Use MasterFormLayout, MasterFieldGroup, MasterActions
- [ ] WeightCreate.jsx - Use MasterFormLayout, MasterFieldGroup, MasterActions
- [ ] GrindCreate.jsx - Use MasterFormLayout, MasterFieldGroup, MasterActions
- [ ] DeductionSalesCreate.jsx - Use MasterFormLayout, MasterFieldGroup, MasterActions
- [ ] DeductionPurchaseCreate.jsx - Use MasterFormLayout, MasterFieldGroup, MasterActions
- [ ] PurchaseDeductionCreate.jsx - Use MasterFormLayout, MasterFieldGroup, MasterActions

## Steps:
1. Import the reusable components
2. Replace hardcoded HTML sections with modular components
3. Pass data and handlers as props
4. Test the page still works correctly

## Example Pattern:

### Before (Hardcoded):
```
jsx
<div className="entry-form">
  <div className="col">
    <div className="row"><label>Bill No</label><input /></div>
    ...
  </div>
</div>
```

### After (Using Modular Component):
```
jsx
import { EntryTopFrame } from './entry';

<EntryTopFrame 
  fields={salesFields} 
  data={formData} 
  onChange={handleChange} 
/>
