# ERP Modular Conversion TODO

## Status: IN PROGRESS

## Phase 1: Master Pages Conversion
### Priority 1: Simple Master Create Pages (using MasterFormLayout)
- [ ] SupplierCreate.jsx → Use MasterFormLayout + MasterFieldGroup + MasterActions
- [ ] CustomerCreate.jsx → Use MasterFormLayout + MasterFieldGroup + MasterActions
- [ ] CityCreate.jsx → Use MasterFormLayout + MasterFieldGroup + MasterActions
- [ ] AreaCreate.jsx → Use MasterFormLayout + MasterFieldGroup + MasterActions
- [ ] TransportCreate.jsx → Use MasterFormLayout + MasterFieldGroup + MasterActions
- [ ] WeightCreate.jsx → Use MasterFormLayout + MasterFieldGroup + MasterActions
- [ ] ItemCreate.jsx → Use MasterFormLayout + MasterFieldGroup + MasterActions
- [ ] ItemGroupCreate.jsx → Use MasterFormLayout + MasterFieldGroup + MasterActions
- [ ] LedgerCreate.jsx → Use MasterFormLayout + MasterFieldGroup + MasterActions
- [ ] LedgerGroupCreate.jsx → Use MasterFormLayout + MasterFieldGroup + MasterActions
- [ ] FlourMillCreate.jsx → Use MasterFormLayout + MasterFieldGroup + MasterActions
- [ ] PapadCompanyCreate.jsx → Use MasterFormLayout + MasterFieldGroup + MasterActions
- [ ] PTransCreate.jsx → Use MasterFormLayout + MasterFieldGroup + MasterActions
- [ ] ConsigneeCreate.jsx → Use MasterFormLayout + MasterFieldGroup + MasterActions
- [ ] SenderCreate.jsx → Use MasterFormLayout + MasterFieldGroup + MasterActions
- [ ] GrindCreate.jsx → Use MasterFormLayout + MasterFieldGroup + MasterActions

### Priority 2: Master Update Pages
- [ ] SupplierUpdate.jsx → Use MasterFormLayout + MasterFieldGroup + MasterActions
- [ ] CityUpdate.jsx → Use MasterFormLayout + MasterFieldGroup + MasterActions
- [ ] AreaUpdate.jsx → Use MasterFormLayout + MasterFieldGroup + MasterActions
- [ ] PTransUpdate.jsx → Use MasterFormLayout + MasterFieldGroup + MasterActions

## Phase 2: Simple Entry Pages Conversion
### Priority 1: Entry Pages without Tables (using EntryTopFrame + EntryActions)
- [ ] AdvanceCreate.jsx → Use EntryTopFrame + EntryActions
- [ ] StockAdjustCreate.jsx → Use EntryTopFrame + EntryActions
- [ ] WeightConversionCreate.jsx → Use EntryTopFrame + EntryActions

## Phase 3: Complex Entry Pages (Full Entry Components)
### Already Done
- [x] SalesCreate.jsx → Using EntryTopFrame, EntryItemsTable, EntryTotalsRow, EntryBottomSummary, EntryActions

### Need Verification/Updates
- [ ] PurchaseCreate.jsx → Verify using entry components
- [ ] SalesEntry.jsx → Convert to use entry components
- [ ] PurchaseEntry.jsx → Convert to use entry components
- [ ] Other complex entry pages

## Phase 4: Standardized Display Pages
- [ ] Create Standard Display Pages for all modules

## UI/UX Improvements Required
- [ ] Ensure all pages use same fonts (ERP theme)
- [ ] Ensure consistent button styles
- [ ] Ensure consistent spacing
- [ ] Ensure consistent table styles
