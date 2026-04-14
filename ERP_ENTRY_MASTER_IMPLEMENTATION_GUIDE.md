# ERP Entry & Master Pages Implementation Guide

## Overview
This guide explains how to use the standardized Entry and Master layout components while preserving the original HTML structure.

---

## 🎯 CORE PRINCIPLE

**Keep Original HTML Structure** - The goal is to:
- ✅ Use original HTML form structure
- ✅ Use original field sequence  
- ✅ Use original table columns
- ✅ Use original page format
- ✅ But wrap in standardized layout components
- ✅ Apply uniform theme (White + Blue)

---

## 📁 ENTRY FOLDER PAGES STRUCTURE

Entry pages must follow this structure:

```
jsx
import { 
  EntryLayout, 
  EntryHeader, 
  EntryContentWrapper, 
  EntryActionSection, 
  EntryFooter,
  SearchBar 
} from './components/ui';

const EntryPageCreate = () => {
  return (
    <EntryLayout>
      {/* Page Title Header */}
      <EntryHeader title="Sales Entry Create" />

      {/* Main Content Area - Contains original HTML fields */}
      <EntryContentWrapper>
        
        {/* Original HTML form structure here - unchanged */}
        <form>
          {/* Original fields - same order, same names */}
          <div className="row">
            <label>Invoice No</label>
            <input type="text" name="invoice_no" />
          </div>
          
          <div className="row">
            <label>Date</label>
            <input type="date" name="date" />
          </div>
          
          {/* All original fields go here */}
        </form>

      </EntryContentWrapper>

      {/* Action Buttons - Save */}
      <EntryActionSection 
        type="create"
        showSave={true}
        onSave={handleSave}
        saving={saving}
      />

      {/* Footer with row count and date */}
      <EntryFooter rowCount={0} />
      
    </EntryLayout>
  );
};
```

### Entry Display Page Structure:

```
jsx
const EntryPageDisplay = () => {
  return (
    <EntryLayout>
      <EntryHeader title="Sales Entry Display" />

      <EntryContentWrapper>
        {/* Search Bar */}
        <SearchBar 
          value={searchText}
          onChange={setSearchText}
          placeholder="Search sales..."
        />

        {/* Original HTML Table - unchanged */}
        <table className="grid-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Invoice No</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Original table rows */}
          </tbody>
        </table>
      </EntryContentWrapper>

      {/* Action Buttons - Print, Refresh */}
      <EntryActionSection 
        type="display"
        showPrint={true}
        showRefresh={true}
        onPrint={handlePrint}
        onRefresh={handleRefresh}
      />

      <EntryFooter rowCount={data.length} />
    </EntryLayout>
  );
};
```

---

## 📁 MASTER FOLDER PAGES STRUCTURE

Master pages must follow this structure:

```
jsx
import { 
  MasterLayout, 
  MasterHeader, 
  MasterContentWrapper, 
  MasterActionSection, 
  MasterFooter,
  SearchBar 
} from './components/ui';

const MasterPageCreate = () => {
  return (
    <MasterLayout>
      {/* Page Title Header */}
      <MasterHeader title="Customer Create" />

      {/* Main Content Area - Contains original HTML fields */}
      <MasterContentWrapper>
        
        {/* Original HTML form structure here - unchanged */}
        <form>
          {/* Original fields - same order, same names */}
          <div className="row">
            <label>Customer Name</label>
            <input type="text" name="name" />
          </div>
          
          <div className="row">
            <label>Mobile</label>
            <input type="text" name="mobile" />
          </div>
          
          {/* All original fields go here */}
        </form>

      </MasterContentWrapper>

      {/* Action Buttons - Save */}
      <MasterActionSection 
        type="create"
        showSave={true}
        onSave={handleSave}
        saving={saving}
      />

      {/* Footer with row count and date */}
      <MasterFooter rowCount={0} />
      
    </MasterLayout>
  );
};
```

### Master Display Page Structure:

```
jsx
const MasterPageDisplay = () => {
  return (
    <MasterLayout>
      <MasterHeader title="Customer Display" />

      <MasterContentWrapper>
        {/* Search Bar */}
        <SearchBar 
          value={searchText}
          onChange={setSearchText}
          placeholder="Search customers..."
        />

        {/* Original HTML Table - unchanged */}
        <table className="grid-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Customer Name</th>
              <th>Mobile</th>
              <th>Area</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Original table rows with UPDATE, DELETE, PRINT buttons */}
          </tbody>
        </table>
      </MasterContentWrapper>

      {/* Action Buttons - Print, Refresh, Add New */}
      <MasterActionSection 
        type="display"
        showPrint={true}
        showRefresh={true}
        showAddNew={true}
        onPrint={handlePrint}
        onRefresh={handleRefresh}
        onAddNew={handleAddNew}
      />

      <MasterFooter rowCount={data.length} />
    </MasterLayout>
  );
};
```

---

## 🎨 UI ALIGNMENT MODIFICATIONS

### What Changes (Standardized):

| Element | Standardization |
|---------|-----------------|
| **Spacing** | 20px padding, 15px gaps |
| **Button placement** | Bottom right, aligned |
| **Font size** | 14px standard |
| **Card design** | White background, soft shadow |
| **Section margins** | 20px between sections |
| **Header style** | Blue gradient (#1565C0) |
| **Search bar** | Top right, 300px width |
| **Table styling** | Blue header, alternating rows |
| **Hover effects** | On rows and buttons |

### What Stays the Same (Original HTML):

- ❌ Field order
- ❌ Field names  
- ❌ Table column names
- ❌ Core logic
- ❌ Module separation (Entry / Master)
- ❌ Folder structure

---

## 🔘 BUTTON STANDARDIZATION

### Create Pages:
- **SAVE** button - Blue (#1565C0)

### Display Pages:
- **UPDATE** button - Green (#4CAF50)
- **DELETE** button - Red (#f44336)
- **PRINT** button - Grey (#9E9E9E)

### All Buttons:
- Same height: 38px
- Same border radius: 4px
- Same font size: 14px bold
- Same hover effect

---

## 📊 COMPLETE PAGE WRAPPING FORMAT

### Entry Create Page:
```
jsx
<EntryLayout>
  <EntryHeader title="Module Name Create" />
  <EntryContentWrapper>
    {/* Original HTML fields */}
  </EntryContentWrapper>
  <EntryActionSection 
    type="create"
    showSave={true}
    onSave={handleSave}
  />
</EntryLayout>
```

### Entry Display Page:
```
jsx
<EntryLayout>
  <EntryHeader title="Module Name Display" />
  <EntryContentWrapper>
    <SearchBar value={search} onChange={setSearch} />
    {/* Original HTML table */}
  </EntryContentWrapper>
  <EntryActionSection 
    type="display"
    showPrint={true}
    showRefresh={true}
    onPrint={handlePrint}
    onRefresh={handleRefresh}
  />
  <EntryFooter rowCount={data.length} />
</EntryLayout>
```

### Master Create Page:
```
jsx
<MasterLayout>
  <MasterHeader title="Module Name Create" />
  <MasterContentWrapper>
    {/* Original HTML fields */}
  </MasterContentWrapper>
  <MasterActionSection 
    type="create"
    showSave={true}
    onSave={handleSave}
  />
</MasterLayout>
```

### Master Display Page:
```
jsx
<MasterLayout>
  <MasterHeader title="Module Name Display" />
  <MasterContentWrapper>
    <SearchBar value={search} onChange={setSearch} />
    {/* Original HTML table with UPDATE, DELETE, PRINT */}
  </MasterContentWrapper>
  <MasterActionSection 
    type="display"
    showPrint={true}
    showRefresh={true}
    showAddNew={true}
    onPrint={handlePrint}
    onRefresh={handleRefresh}
    onAddNew={handleAddNew}
  />
  <MasterFooter rowCount={data.length} />
</MasterLayout>
```

---

## 🎯 KEY COMPONENTS

### Entry Components (from `./components/ui`):
- `EntryLayout` - Main wrapper
- `EntryHeader` - Blue header with title
- `EntryContentWrapper` - Content area
- `EntryActionSection` - Bottom action buttons
- `EntryFooter` - Bottom info (rows, date)
- `SearchBar` - Search input

### Master Components (from `./components/ui`):
- `MasterLayout` - Main wrapper
- `MasterHeader` - Blue header with title
- `MasterContentWrapper` - Content area  
- `MasterActionSection` - Bottom action buttons
- `MasterFooter` - Bottom info (rows, date)
- `SearchBar` - Search input

---

## 📝 EXAMPLE: Converting Existing Component

### Before (Original HTML structure):
```
jsx
// CustomerCreate.jsx
const CustomerCreate = () => {
  return (
    <div className="customer-create">
      <div className="header">Customer Create</div>
      <form>
        <div className="row">
          <label>Name</label>
          <input type="text" name="name" />
        </div>
        {/* more fields */}
      </form>
      <button className="save-btn">Save</button>
    </div>
  );
};
```

### After (With Layout Components):
```
jsx
// CustomerCreate.jsx
import { 
  EntryLayout, 
  EntryHeader, 
  EntryContentWrapper, 
  EntryActionSection 
} from './components/ui';

const CustomerCreate = () => {
  return (
    <EntryLayout>
      <EntryHeader title="Customer Create" />
      <EntryContentWrapper>
        {/* Original HTML - unchanged */}
        <form>
          <div className="row">
            <label>Name</label>
            <input type="text" name="name" />
          </div>
          {/* more fields - same as before */}
        </form>
      </EntryContentWrapper>
      <EntryActionSection 
        type="create"
        showSave={true}
        onSave={handleSave}
      />
    </EntryLayout>
  );
};
```

---

## ✅ CHECKLIST FOR NEW COMPONENTS

When converting any Entry/Master page:

- [ ] Wrap in `EntryLayout` or `MasterLayout`
- [ ] Add `EntryHeader` or `MasterHeader` with title
- [ ] Wrap content in `EntryContentWrapper` or `MasterContentWrapper`
- [ ] Keep original HTML fields/table exactly as-is
- [ ] Add `EntryActionSection` or `MasterActionSection`
- [ ] Add `EntryFooter` or `MasterFooter` for display pages
- [ ] Add `SearchBar` for display pages
- [ ] Use standardized buttons (Blue for Save, Green for Update, Red for Delete, Grey for Print)

---

## 🎨 THEME COLORS

| Element | Color Code |
|---------|------------|
| Background | #FFFFFF (White) |
| Primary | #1565C0 (Blue) |
| Primary Dark | #0D47A1 |
| Primary Light | #1976D2 |
| SAVE Button | #1565C0 (Blue) |
| UPDATE Button | #4CAF50 (Green) |
| DELETE Button | #f44336 (Red) |
| CANCEL Button | #757575 (Grey) |
| PRINT Button | #9E9E9E (Light Grey) |
| Table Header | #1565C0 (Blue) |
| Table Row Alt | #fafafa |
| Table Hover | #f5f9ff |
| Border | #e0e0e0 |
| Input Border | #7fa1d6 |
| Input Focus | #1565C0 |

---

## 📁 FOLDER STRUCTURE

```
frontend/src/
├── components/
│   ├── ui/                      # UI Components (created)
│   │   ├── Layout.jsx          # Entry/Master layouts
│   │   ├── Button.jsx          # Standardized buttons
│   │   ├── FormFields.jsx      # Form inputs
│   │   ├── DataTable.jsx       # Tables
│   │   └── index.js            # Exports
│   ├── CustomerCreate.jsx      # Entry page (convert)
│   ├── CustomerDisplay.jsx     # Master page (convert)
│   └── ...
```

---

## 🚀 NEXT STEPS

1. Convert all Entry Create pages to use `EntryLayout`
2. Convert all Entry Display pages to use `EntryLayout` + SearchBar
3. Convert all Master Create pages to use `MasterLayout`
4. Convert all Master Display pages to use `MasterLayout` + SearchBar
5. Apply standardized button styles throughout
6. Test all pages for consistent UI
