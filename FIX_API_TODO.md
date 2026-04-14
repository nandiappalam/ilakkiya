# API Fix TODO - Components using direct fetch that need updating

## Problem
Components are using direct `fetch('/api/...')` calls which fail in Tauri EXE because there's no HTTP server running.

## Solution
Update each component to use `api.js` (which uses Tauri invoke) instead of direct fetch.

## Components to Update (using search)

### High Priority - Display Components
- [ ] CustomerDisplay.jsx
- [ ] SupplierDisplay.jsx
- [ ] CityDisplay.jsx
- [ ] AreaDisplay.jsx
- [ ] LedgerDisplay.jsx
- [ ] ItemDisplay.jsx

### Medium Priority - Create Components
- [ ] CustomerCreate.jsx
- [ ] SupplierCreate.jsx
- [ ] CityCreate.jsx
- [ ] AreaCreate.jsx
- [ ] LedgerCreate.jsx
- [ ] ItemCreate.jsx

### Entry Components
- [ ] SalesEntry.jsx
- [ ] PurchaseCreation.jsx
- [ ] AdvanceEntry.jsx

### Other Components
- [ ] CompanySelection.jsx
- [ ] LoginPage.jsx

## Approach
1. For each component, replace:
   
```
javascript
   fetch('/api/customers')
   
```
   with:
   
```
javascript
   import api from '../utils/api';
   api.getCustomers()
   
```

2. Update response handling since api.js returns `{ success, data, message }` format

## Testing
After updating, rebuild and test in Tauri EXE to verify API calls work.
