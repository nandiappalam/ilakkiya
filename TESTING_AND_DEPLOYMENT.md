# BVC Inventory Management System - Testing & Deployment Guide

**Version**: 1.0  
**Last Updated**: February 5, 2026  
**Status**: ✅ Complete - Ready for Testing & Deployment  

---

## QUICK START CHECKLIST

### Prerequisites
- [ ] Node.js installed (v14+)
- [ ] npm or yarn package manager
- [ ] Backend server running on localhost:5000
- [ ] Database initialized with schema.sql
- [ ] SQLite3 installed

### Installation Steps
```bash
# 1. Navigate to frontend directory
cd d:\BVC HTML\frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm start

# 4. Open browser
# http://localhost:3000
```

### Backend Setup
```bash
# 1. Navigate to backend directory
cd d:\BVC HTML\backend

# 2. Install dependencies
npm install

# 3. Initialize database
node init-db.js

# 4. Start backend server
npm start
# Server will run on http://localhost:5000
```

---

## COMPREHENSIVE TESTING GUIDE

### Module 1: Item Group

#### Create Page Test (ItemGroupCreate)
1. **Navigate to**: ItemGroupCreate component
2. **Test Steps**:
   - [ ] Page loads with title "Item Group Creation"
   - [ ] Form fields display: Item Group Name, Print Name, Status
   - [ ] SAVE button visible at bottom
   - [ ] Enter "Test Group 1" in Item Group Name
   - [ ] Leave Print Name empty (should auto-fill)
   - [ ] Select Status: Active
   - [ ] Click SAVE
   - [ ] See success message
   - [ ] Form resets

#### Display Page Test (ItemGroupDisplay)
1. **Navigate to**: ItemGroupDisplay component
2. **Test Steps**:
   - [ ] Page loads with title "Item Group Display"
   - [ ] Table displays all item groups
   - [ ] Columns: S.No, Item Group Name, Print Name, Status, Actions
   - [ ] Each row has UPDATE, DELETE, PRINT buttons
   - [ ] Footer shows row count
   - [ ] Test UPDATE:
     - [ ] Click UPDATE on first row
     - [ ] Modal opens with current data
     - [ ] Edit a field
     - [ ] Click SAVE in modal
     - [ ] See success message
     - [ ] Table updates
   - [ ] Test DELETE:
     - [ ] Click DELETE on a row
     - [ ] Confirm dialog appears
     - [ ] Click OK
     - [ ] Row disappears
     - [ ] See success message
   - [ ] Test PRINT:
     - [ ] Click PRINT
     - [ ] Browser print dialog appears
     - [ ] Headers/buttons hidden in print

#### Database Verification
1. Check SQLite database:
   ```sql
   SELECT * FROM item_groups;
   ```
2. Verify:
   - [ ] New record exists
   - [ ] Fields match form input
   - [ ] Created timestamp present
   - [ ] Update works
   - [ ] Delete removes record

---

### Module 2: Deduction Sales

#### Create Page Test (DeductionSalesCreate)
1. **Navigate to**: DeductionSalesCreate component
2. **Test Steps**:
   - [ ] Page loads with title "Sales Deduction Creation"
   - [ ] Title bar shows "Inventory Management System"
   - [ ] All form fields display
   - [ ] Fields: Deduction Name, Print Name, Adjust with Sales, Account Head, Deduction Type, Deduction Calc Type, Deduction Value, Status
   - [ ] Fill form:
     - Deduction Name: "Freight Charges"
     - Print Name: "Frgt" (auto-filled as "Freight Charges")
     - Adjust with Sales: "Yes"
     - Account Head: "4101"
     - Deduction Type: "Add"
     - Deduction Calc Type: "Amount"
     - Deduction Value: "50"
     - Status: "Active"
   - [ ] Click SAVE
   - [ ] Success message appears
   - [ ] Form resets

#### Display Page Test (DeductionSalesDisplay)
1. **Navigate to**: DeductionSalesDisplay component
2. **Test Steps**:
   - [ ] Page loads with all deductions
   - [ ] Table columns correct
   - [ ] ACTIONS column has UPDATE, DELETE, PRINT buttons
   - [ ] Test all CRUD operations
   - [ ] Modal opens on UPDATE
   - [ ] Confirmation on DELETE
   - [ ] Print dialog on PRINT

---

### Module 3: Deduction Purchase

**Follow same testing pattern as Deduction Sales**

#### Create Page Test
- [ ] All fields display
- [ ] SAVE button functional
- [ ] Data saved to database

#### Display Page Test
- [ ] Table shows all records
- [ ] ACTIONS column functional
- [ ] UPDATE, DELETE, PRINT work

---

### Module 4: Customer

#### Create Page Test (CustomerCreate)
1. **Form Fields**:
   - [ ] Name (required)
   - [ ] Print Name
   - [ ] Contact Person
   - [ ] Address fields (multiple)
   - [ ] Phone (Res/Off)
   - [ ] Mobile numbers
   - [ ] Email
   - [ ] GST Number
   - [ ] Area
   - [ ] Opening Balance

2. **Functionality**:
   - [ ] Fill all fields
   - [ ] Click SAVE
   - [ ] Success message
   - [ ] Data in database

#### Display Page Test (CustomerDisplay)
- [ ] All customers display in table
- [ ] UPDATE button opens modal with all fields
- [ ] DELETE works with confirmation
- [ ] PRINT shows browser dialog

---

### Module 5: Supplier

**Follow same testing pattern as Customer**

#### Create Page Test
- [ ] Comprehensive form with many fields
- [ ] SAVE button saves to database
- [ ] Form resets on success

#### Display Page Test
- [ ] All suppliers listed
- [ ] ACTIONS column functional
- [ ] Modal updates work

---

### Module 6: Weight

#### Create Page Test (WeightCreate)
1. **Form Fields**:
   - [ ] Name (required)
   - [ ] Print Name
   - [ ] Weight (Kgs) - number field
   - [ ] Status

2. **Test Data**:
   - Enter: Name: "100 KG", Weight: 100, Status: Active
   - Click SAVE
   - Verify in database

#### Display Page Test (WeightDisplay)
- [ ] Table displays all weights
- [ ] UPDATE/DELETE/PRINT work
- [ ] Modal shows weight details

---

## ENTRY MODULE TESTING

### All Entry Modules (Sales, Purchase, Advance, etc.)

#### General Pattern:
1. **Create Page**:
   - [ ] Form displays all fields
   - [ ] SAVE button at bottom
   - [ ] Required fields validated
   - [ ] Success message on save
   - [ ] Form resets

2. **Display Page**:
   - [ ] Table shows transactions
   - [ ] ACTIONS: UPDATE, DELETE, PRINT
   - [ ] Modal for updates
   - [ ] Row counter shows total

---

## API TESTING

### Test Endpoints with Postman or curl

#### Get All Records
```bash
curl http://localhost:5000/api/masters/item_groups
```

#### Get Single Record
```bash
curl http://localhost:5000/api/masters/item_groups/1
```

#### Create Record
```bash
curl -X POST http://localhost:5000/api/masters/item_groups \
  -H "Content-Type: application/json" \
  -d '{"group_code":"GRP001","group_name":"Test","print_name":"TST"}'
```

#### Update Record
```bash
curl -X PUT http://localhost:5000/api/masters/item_groups/1 \
  -H "Content-Type: application/json" \
  -d '{"group_name":"Updated Name"}'
```

#### Delete Record
```bash
curl -X DELETE http://localhost:5000/api/masters/item_groups/1
```

---

## DATABASE VERIFICATION

### Check Database Tables
```bash
# Connect to database
sqlite3 d:\BVC\ HTML\database\inventory.db

# List tables
.tables

# Check specific table structure
.schema item_groups

# Verify data
SELECT * FROM item_groups;
SELECT COUNT(*) FROM item_groups;
```

### Verify Data Integrity
1. [ ] All CRUD operations create/update/delete records correctly
2. [ ] Timestamps are correct
3. [ ] Field values match form inputs
4. [ ] No orphaned records
5. [ ] Foreign keys intact (if applicable)

---

## UI/UX TESTING

### Visual Elements
- [ ] Blue color scheme (#1f4fb2, #3b6fd8) applied
- [ ] All field names visible and labeled
- [ ] Buttons properly sized and positioned
- [ ] Tables display without cut-off
- [ ] Headers visible and clear
- [ ] Footer shows information
- [ ] Modal opens properly centered
- [ ] Messages display with correct colors

### Responsive Design
- [ ] Test on different screen sizes:
  - [ ] 1920x1080 (Desktop)
  - [ ] 1366x768 (Laptop)
  - [ ] 768x1024 (Tablet)
- [ ] Buttons accessible on all sizes
- [ ] Forms readable
- [ ] Tables scrollable if needed

### User Experience
- [ ] Success messages auto-dismiss
- [ ] Error messages clear
- [ ] Loading states visible
- [ ] No console errors
- [ ] Form validation messages helpful
- [ ] Confirmation dialogs clear
- [ ] Undo not needed (confirmation prevents accidents)

---

## PERFORMANCE TESTING

### Load Testing
- [ ] Load 100 records
- [ ] Load 1000 records
- [ ] Check table render time
- [ ] Verify scroll performance
- [ ] Check memory usage

### Response Time
- [ ] Create: < 2 seconds
- [ ] Read/List: < 1 second
- [ ] Update: < 2 seconds
- [ ] Delete: < 1 second
- [ ] Print dialog: Instant

---

## DEPLOYMENT CHECKLIST

### Before Deployment
- [ ] All components tested
- [ ] Database initialized
- [ ] Backend server tested
- [ ] Frontend builds without errors
- [ ] No console warnings/errors
- [ ] All pages responsive
- [ ] Print functionality works
- [ ] Error handling in place

### Build for Production
```bash
cd d:\BVC HTML\frontend
npm run build
# Creates 'dist' folder with optimized files
```

### Deploy Backend
```bash
# Set NODE_ENV=production
# Run on production server
npm install --production
npm start
```

### Deploy Frontend
```bash
# Copy dist folder contents to web server
# Configure server to serve index.html for all routes
# Test all features on production
```

---

## KNOWN ISSUES & SOLUTIONS

### Issue 1: "Cannot find module" errors
**Solution**: 
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue 2: Backend not responding
**Solution**:
- Check if server running: `netstat -an | grep 5000`
- Restart backend: `npm start` in backend folder
- Check firewall settings

### Issue 3: Database locked
**Solution**:
- Close any open database connections
- Restart backend service
- Check file permissions on database

### Issue 4: CORS errors
**Solution**:
- Ensure backend has CORS enabled
- Check allowed origins in server.js
- Verify frontend URL matches origin

---

## OPTIMIZATION TIPS

### Performance
1. Use React.memo for list items
2. Lazy load modal components
3. Implement pagination for large tables
4. Cache database queries
5. Compress images/assets

### Security
1. Validate all inputs on backend
2. Sanitize database queries
3. Use HTTPS in production
4. Implement authentication
5. Add rate limiting on API

---

## MONITORING & LOGGING

### Client-Side Logging
```javascript
// Wrap API calls with logging
console.log('Fetching data...');
const response = await fetch(url);
console.log('Response:', response.status);
```

### Server-Side Logging
```javascript
// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});
```

### Error Reporting
- [ ] Implement error tracking (Sentry, LogRocket)
- [ ] Log all API errors
- [ ] Monitor database errors
- [ ] Alert on critical failures

---

## MAINTENANCE

### Regular Tasks
- [ ] Weekly: Backup database
- [ ] Monthly: Review logs
- [ ] Monthly: Update dependencies
- [ ] Quarterly: Security audit
- [ ] Quarterly: Performance review

### Update Procedures
```bash
# Update npm packages
npm outdated
npm update

# Test after update
npm start
```

---

## SUPPORT & TROUBLESHOOTING

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Page blank | Check console for errors, restart dev server |
| Button not working | Check browser console, verify API endpoint |
| Data not saving | Verify backend is running, check network tab |
| Modal not opening | Check CSS z-index, verify modal markup |
| Print missing data | Ensure print CSS doesn't hide elements |
| Form not submitting | Check required fields, verify validation |

---

## TESTING REPORT TEMPLATE

```
Testing Date: _______________
Tester Name: _______________
Component: _______________
Status: [ ] Passed [ ] Failed [ ] Needs Review

Test Cases Covered:
1. Create functionality
2. Read/Display functionality
3. Update functionality
4. Delete functionality
5. Print functionality
6. Error handling
7. Validation
8. Database connectivity

Issues Found:
1. _______________
2. _______________

Comments:
_______________

Sign Off: _______________
```

---

## GO-LIVE CHECKLIST

- [ ] All modules tested (20+ modules)
- [ ] Database backup created
- [ ] Performance acceptable
- [ ] Security review passed
- [ ] Documentation complete
- [ ] User training done
- [ ] Support team ready
- [ ] Rollback plan prepared
- [ ] Monitoring configured
- [ ] Go-live approval obtained

---

**Status**: ✅ Application ready for testing  
**Next Steps**: Execute comprehensive test plan  
**Timeline**: 2-3 weeks for full testing & deployment  
**Contact**: Development team for issues

