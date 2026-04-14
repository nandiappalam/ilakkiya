# HTML to React Component Mapping

## Master Modules - Format Compliance

This document shows how each React component maps to the HTML format specification from Entry and Master folders.

---

## MASTER MODULE COMPONENTS

### 1. ItemGroup - Format Standard (item group Create.html / item group display.html)

**HTML Format:**
- Top Header with blue background (#1e5ed8)
- Page title with form/table content
- Form box with input fields in grid layout (label: input ratio)
- Footer with row count

**React Implementation:** ✅
- `ItemGroupCreate.jsx` → Form with SAVE button
- `ItemGroupDisplay.jsx` → Table with UPDATE/DELETE/PRINT actions
- CSS: `item group display.css` (updated with action buttons)
- Database: `item_groups` table

**Fields (Create):**
- Item Group Name
- Print Name (optional)
- Status (Active/Inactive)

**Fields (Display):**
- S.No
- Item Group Name
- Print Name
- Status
- **Actions** (UPDATE, DELETE, PRINT)

---

### 2. DeductionSales - Format Standard (deduction sales Create.html / deduction sales Display.html)

**HTML Format:**
- Title bar with company name
- Menu bar
- Page header
- Table-based form layout OR grid table
- Footer with buttons

**React Implementation:** ✅
- `DeductionSalesCreate.jsx` → Form-based with SAVE at bottom
- `DeductionSalesDisplay.jsx` → Table-based with row actions
- CSS: Updated with professional styling
- Database: `deduction_sales` table

**Fields (Create):**
- Deduction Name (Print Name)
- Adjust with Sales Amount (Yes/No)
- Account Head
- Deduction Type (Add/Less)
- Deduction Calc Type (Amount/Percentage)
- Deduction Value
- Status

**Fields (Display):**
- S.No
- Deduction Name
- Adjust with Sales
- Account Head
- Add/Subtract
- Amount/Percent
- Deduction Value
- **Actions** (UPDATE, DELETE, PRINT)

---

### 3. DeductionPurchase - Format Standard (deduction purchase Create.html / deduction purchase Display.html)

**HTML Format:**
- Top bar with company name
- Window header with close button
- Form wrapper with form box
- Rows with labels and inputs
- Button at bottom

**React Implementation:** ✅
- `DeductionPurchaseCreate.jsx` → Form layout with SAVE button
- `DeductionPurchaseDisplay.jsx` → Table with ACTIONS column
- CSS: Professional styling maintained
- Database: `deduction_purchase` table

**Fields (Create):**
- Deduction Name (Print Name)
- Affect Cost of Goods
- Debit Side Adjust with
- Account Head
- Credit Side Adjust with
- Deduction Type
- Deduction Calc Type
- Deduction Value
- Status

**Fields (Display):**
- S.No
- Deduction Name
- Debit Adjust
- Account Head
- Credit Adjust
- Ded Type
- **Actions** (UPDATE, DELETE, PRINT)

---

### 4. Customer - Format Standard (customer Create.html / customer Display.html)

**HTML Format:**
- Top bar with company
- Window header
- Large form with multiple fields in grid layout OR Table with loaded data
- Footer with Options

**React Implementation:** ✅
- `CustomerCreate.jsx` → Comprehensive form with all customer fields
- `CustomerDisplay.jsx` → Table with all customers and ACTIONS
- CSS: Modern professional styling
- Database: `customer_master` table

**Fields (Create):**
- Name
- Print Name
- Contact Person
- Address (multiple lines)
- Phones (Res/Off)
- Mobile numbers
- Email
- GST/TIN
- Area
- Opening Balance

**Fields (Display):**
- S.No
- Customer Name
- Contact Person
- Area
- Mobile
- Opening Balance
- Type (GST/Non-GST)
- **Actions** (UPDATE, DELETE, PRINT)

---

### 5. Supplier - Format Standard (suppliers Create.html / suppliers Display.html)

**HTML Format:**
- Container with header
- Entry form with grid layout
- Multiple input fields and textareas
- Save button

**React Implementation:** ✅
- `SupplierCreate.jsx` → Form with all supplier details
- `SupplierDisplay.jsx` → Table with suppliers and ACTIONS
- CSS: `supplier-creation.css`, `supplier-display.css`
- Database: `supplier_master` table

**Fields (Create):**
- Name
- Print Name
- Contact Person
- Address (with textarea)
- Phone (Res/Off)
- Mobile
- Email
- Web
- GST/TIN No
- Area
- Transport
- Credit Limits (Days/Amount)

**Fields (Display):**
- S.No
- Supplier Name
- Contact Person
- Area
- Mobile
- Opening Balance
- Type (GST/Non-GST)
- **Actions** (UPDATE, DELETE, PRINT)

---

### 6. Weight - Format Standard (weight Create.html / weight dispaly.html)

**HTML Format:**
- App background gradient
- Form container with blue title bar
- Form body with rows
- Form footer with Save button

**React Implementation:** ✅
- `WeightCreate.jsx` → Form with gradient background
- `WeightDisplay.jsx` → Table with weight records and ACTIONS
- CSS: `WeightCreate.css`, `WeightDisplay.css`
- Database: `weightmaster` table

**Fields (Create):**
- Name
- Print Name
- Weight (Kgs) - number input
- Status (Active/Inactive)

**Fields (Display):**
- S.No
- Weight Name
- Print Name
- Weight (Kgs)
- Status
- **Actions** (UPDATE, DELETE, PRINT)

---

## ENTRY MODULE COMPONENTS

### Following Same HTML Format Standards

All Entry modules follow similar HTML structure:
- **Create Pages**: Form with fields at bottom SAVE button
- **Display Pages**: Table with row data and ACTIONS column
- **Consistent theme**: Blue/White colors, professional layout
- **Database connected**: Each saves to appropriate transaction table

---

## FORMAT ELEMENTS STANDARDIZED

### ✅ All Create Pages Include:
1. **Header**: Title bar with company name
2. **Title**: Page title with form designation
3. **Form**: Organized fields with labels
4. **Inputs**: Consistent styling
5. **Button**: SAVE at bottom
6. **Validation**: Required field checks
7. **Messages**: Success/Error feedback
8. **Database**: POST to backend

### ✅ All Display Pages Include:
1. **Header**: Title bar with company name
2. **Title**: Page title with display designation
3. **Table**: Data in organized columns
4. **ACTIONS**: UPDATE, DELETE, PRINT for each row
5. **Footer**: Row count and info
6. **Modal**: For inline editing on UPDATE
7. **Messages**: Success/Error feedback
8. **Database**: GET/PUT/DELETE operations

### ✅ Consistent Styling:
1. **Colors**: Blue (#1f4fb2, #3b6fd8) and White theme
2. **Fonts**: Segoe UI / Arial / sans-serif
3. **Buttons**: Colored action buttons
4. **Forms**: Grid layout with labels
5. **Tables**: Bordered cells with hover effects
6. **Responsive**: Works on different screen sizes
7. **Print-friendly**: Hides interactive elements

---

## DATABASE INTEGRATION

### Connection Pattern:
```javascript
fetch('http://localhost:5000/api/masters/{table_name}')
```

### Table Mappings:
| Component | Table | Operations |
|-----------|-------|-----------|
| ItemGroup | item_groups | C, R, U, D |
| DeductionSales | deduction_sales | C, R, U, D |
| DeductionPurchase | deduction_purchase | C, R, U, D |
| Customer | customer_master | C, R, U, D |
| Supplier | supplier_master | C, R, U, D |
| Weight | weightmaster | C, R, U, D |

---

## CSS FILE MAPPING

| Component | CSS Files |
|-----------|-----------|
| ItemGroup | `item group display.css` (updated) |
| DeductionSales | `DeductionSalesCreate.css`, `DeductionSalesDisplay.css` |
| DeductionPurchase | `DeductionPurchaseCreate.css`, `DeductionPurchaseDisplay.css` |
| Customer | `customer-entry.css`, `customer-display.css` |
| Supplier | `supplier-creation.css`, `supplier-display.css` |
| Weight | `WeightCreate.css`, `WeightDisplay.css` |
| Global | `global-styles.css` (new universal styles) |

---

## FORMAT COMPLIANCE CHECKLIST

- ✅ HTML structure converted to React components
- ✅ Form layouts match HTML specifications
- ✅ Table displays match HTML layouts
- ✅ Button placement: SAVE at bottom (Create), ACTIONS in column (Display)
- ✅ Blue and white color scheme applied
- ✅ Database connectivity implemented
- ✅ CRUD operations functional
- ✅ Professional appearance maintained
- ✅ Responsive design implemented
- ✅ Print functionality added
- ✅ Modal updates for inline editing
- ✅ Success/Error messages
- ✅ Row counters and footer info
- ✅ All field names visible and labeled
- ✅ Consistent header/footer styling

---

## VALIDATION RULES

### All Create Forms:
- Required fields checked before submit
- Error messages shown for missing fields
- Form reset on successful save
- Loading state during submission

### All Display Tables:
- Loading state while fetching
- Empty state when no records
- Error handling for API failures
- Confirmation dialogs for delete
- Modal validation for updates

---

## USAGE INSTRUCTIONS

### To Add New Module Following Same Format:

1. **Create Form Component**:
   ```jsx
   import { useState } from 'react';
   
   const ModuleCreate = () => {
     const [formData, setFormData] = useState({...});
     const handleSubmit = async (e) => {
       e.preventDefault();
       const response = await fetch('http://localhost:5000/api/masters/table_name', {
         method: 'POST',
         body: JSON.stringify(formData)
       });
       // Handle response
     };
   };
   ```

2. **Create Display Component**:
   ```jsx
   const ModuleDisplay = () => {
     const [records, setRecords] = useState([]);
     useEffect(() => {
       fetch('http://localhost:5000/api/masters/table_name')
         .then(r => r.json())
         .then(data => setRecords(data));
     }, []);
     // Render table with UPDATE/DELETE/PRINT
   };
   ```

3. **Add CSS**: Create `ModuleCreate.css` and `ModuleDisplay.css` based on templates

4. **Connect Database**: Ensure table exists in `schema.sql`

---

**Status**: ✅ All 6 Master modules + all Entry modules updated  
**Compliance**: 100% with HTML format standards  
**Database**: Connected with full CRUD operations  
**Testing**: Ready for comprehensive testing

