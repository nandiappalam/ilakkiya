# ERP Application Flow Implementation TODO

## Status: In Progress

### Completed:
- [ ] Analyze current codebase

### Pending:
- [ ] 1. Update App.jsx - root route to redirect to CompanySelection
- [ ] 2. Update LoginPage.jsx - use selectedCompany from AuthContext  
- [ ] 3. Update UserCreate.jsx - auto-fill company_id from selectedCompany
- [ ] 4. Update backend/routes/auth.js - accept company_id in login API
- [ ] 5. Update frontend/src/utils/api.js - add company_id parameter to login

## Implementation Order:
1. Backend auth.js - Update login API to accept company_id
2. Frontend api.js - Update login function to send company_id
3. Frontend App.jsx - Update root route to CompanySelection
4. Frontend LoginPage.jsx - Use selectedCompany and handle "no user" case
5. Frontend UserCreate.jsx - Auto-fill company_id when called from new flow
