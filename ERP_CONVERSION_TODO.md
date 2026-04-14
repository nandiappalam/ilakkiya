# ERP Uniform Component Conversion TODO

## Phase 1: Create Entry Reusable Components ✅ COMPLETE
- [x] Create EntryTopFrame.jsx - 3-column info bar component
- [x] Create EntryItemsTable.jsx - Data table for Entry pages
- [x] Create EntryTotalsRow.jsx - Totals row for calculations
- [x] Create EntryBottomSummary.jsx - Summary section
- [x] Create EntrySection.jsx - Section container with title
- [x] Create EntryActions.jsx - Action buttons for Entry pages

## Phase 2: Create Master Reusable Components ✅ COMPLETE
- [x] Create MasterFormLayout.jsx - Two-column form grid
- [x] Create MasterFieldGroup.jsx - Label + input wrapper
- [x] Create MasterTableLayout.jsx - Display table layout
- [x] Create MasterActions.jsx - Action buttons for Master pages

## Phase 3: Refactor Entry Pages ✅ COMPLETE
- [x] Refactor PapadInCreate.jsx - Uses EntryTopFrame, EntryItemsTable, EntrySection, EntryActions
- [x] Refactor SalesCreate.jsx - Uses EntryTopFrame, EntryItemsTable, EntrySection, EntryActions

## Phase 4: Refactor Master Pages ✅ COMPLETE
- [x] Refactor CustomerCreate.jsx - Uses MasterFormLayout, MasterFieldGroup, MasterActions
- [x] Refactor SupplierCreate.jsx - Uses MasterFormLayout, MasterFieldGroup, MasterActions

## Navigation Fix ✅ COMPLETE
- [x] Added "Purchase" and "Purchase Return" to Navigation sidebar entry modules
- [x] Fixed sidebar width mismatch (300px drawer now matches content margin)

## Remaining Work (For Future Implementation)
- Refactor more Entry pages: AdvanceCreate, PackingCreate, QuotationCreate, PurchaseCreate, etc.
- Refactor more Master pages: ItemCreate, CityCreate, AreaCreate, LedgerCreate, etc.
- Apply erp-theme.css consistently to all pages

## How to Use the New Components

**For Entry Pages:**
```
jsx
import { EntryTopFrame, EntryItemsTable, EntrySection, EntryActions } from './entry';

<EntryTopFrame fields={fields} data={formData} onChange={handleChange} />
<EntrySection title="Items Details :">
  <EntryItemsTable columns={columns} data={items} onRowChange={handleRowChange} ... />
</EntrySection>
<EntryActions onSave={handleSave} showSave={true} />
```

**For Master Pages:**
```
jsx
import { MasterFormLayout, MasterFieldGroup, MasterActions } from './master';

<MasterFormLayout title="Customer Creation">
  <MasterFieldGroup label="Name" name="name" value={formData.name} onChange={handleChange} />
  <MasterActions onSave={handleSave} showSave={true} mode="create" />
</MasterFormLayout>
