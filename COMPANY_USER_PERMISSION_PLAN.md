# Company → User Login → Permission Based Access Implementation Plan

## Phase 1: Database Schema Updates
1. Create `companies` table
2. Update `users` table to include company_id
3. Create `user_permissions` table
4. Create `login_history` table

## Phase 2: Backend API Implementation
1. Create companies routes (CRUD)
2. Create auth/login routes
3. Create permissions routes
4. Fix existing backend initialization errors

## Phase 3: Frontend Implementation
1. Create CompanySelectionPage component
2. Create LoginPage component
3. Create UserCreate component with permissions checklist
4. Update Navigation to be permission-based
5. Add route protection
6. Add header with company/year/user info

## Phase 4: Integration
1. Update App.jsx with new flow
2. Implement permission-based sidebar
3. Add button visibility controls

## Detailed Tasks:

### Database Tables:
- companies (id, name, address, gst, contact, created_at)
- users (id, company_id, username, password, role, status, created_at)
- user_permissions (id, user_id, module_name, permission_type)
- login_history (id, user_id, company_id, login_time, logout_time, ip_address)

### Permission Types:
- View
- Create  
- Edit
- Delete
- Print
- Full

### Module Categories:
- Master Modules
- Entry Modules
- Report Modules
- Accounts Modules
- Company Modules
