# ERP Application UI Standardization Guide

## Overview
This document outlines the comprehensive UI standardization implemented for the ERP Web + Tauri application to ensure consistent White & Blue theme across all Entry and Master modules.

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

## 📁 ENTRY & MASTER PAGE STRUCTURE

### Entry Folder Pages Structure:
```
<EntryLayout>
  <EntryHeader title="Module Name" />
  <EntryContentWrapper>
    {/* Original HTML fields/table */}
  </EntryContentWrapper>
  <EntryActionSection type="create|display" />
  <EntryFooter rowCount={n} />
</EntryLayout>
```

### Master Folder Pages Structure:
```
<MasterLayout>
  <MasterHeader title="Module Name" />
  <MasterContentWrapper>
    {/* Original HTML fields/table */}
  </MasterContentWrapper>
  <MasterActionSection type="create|display" />
  <MasterFooter rowCount={n} />
</MasterLayout>
```

---

## 🎨 1. Color Theme Standardization

### Primary Colors
| Element | Color Code |
|---------|------------|
| Primary Blue | `#1565C0` |
| Primary Dark | `#0D47A1` |
| Primary Light | `#1976D2` |
| Background | `#FFFFFF` (White) |
| Secondary | `#757575` (grey) |

### Color Usage
- **Background**: White (#FFFFFF)
- **Primary**: Blue (#1565C0)
- **Navigation/Sidebar**: Blue gradient (`#1565C0` to `#1976D2`)
- **Page Headers**: Blue (`#1565C0`)
- **Table Headers**: Blue (`#1565C0`) with white text
- **Buttons**: See Button Standardization section
- **Input Focus**: Blue border with subtle shadow
- **Card Shadow**: Soft shadow

---

## 🔵 2. Button Standardization

All buttons follow consistent styling:

| Button Type | Background | Text Color | Border Radius |
|-------------|------------|------------|---------------|
| SAVE | `#1565C0` (Blue) | White | 4px |
| UPDATE | `#4CAF50` (Green) | White | 4px |
| DELETE | `#F44336` (Red) | White | 4px |
| CANCEL | `#757575` (Grey) | White | 4px |
| PRINT | `#9E9E9E` (Light Grey) | White | 4px |
| REFRESH | `#2196F3` (Light Blue) | White | 4px |
| ADD NEW | `#4CAF50` (Green) | White | 4px |

### Button Specifications
- **Height**: 38px (primary), 32px (action)
- **Padding**: 10px 24px
- **Font Size**: 14px bold
- **Border Radius**: 4px (same everywhere)
- **Hover Effect**: Slight elevation and color darkening
- **Disabled State**: 60% opacity, cursor not-allowed

---

## 📐 3. Layout Standardization

### Standard Page Layout Structure
```
┌─────────────────────────────────────────┐
│           EntryHeader / MasterHeader    │
│           (Blue with title)              │
├─────────────────────────────────────────┤
│  SearchBar (optional - top right)       │
├─────────────────────────────────────────┤
│                                         │
│     EntryContentWrapper / MasterContent │
│     (Original HTML Table/Form)          │
│                                         │
├─────────────────────────────────────────┤
│  EntryActionSection / MasterActionSect  │
│  (Buttons bottom right)                 │
├─────────────────────────────────────────┤
│  EntryFooter / MasterFooter             │
│  (Row count, Date)                      │
└─────────────────────────────────────────┘
```

### Spacing System
- **Page Padding**: 20px
- **Card Padding**: 20px
- **Form Field Gap**: 15px
- **Button Gap**: 12px
- **Section Spacing**: 20px

---

## 📋 4. Table Standardization

### Table Specifications
| Element | Style |
|---------|-------|
| Header Background | `#1565C0` |
| Header Text | White, Bold |
| Row Background | Alternating white/#fafafa |
| Row Hover | `#f5f9ff` |
| Border | 1px solid `#e0e0e0` |
| Cell Padding | 12px 16px |
| Font Size | 14px |
| Sticky Header | Yes |

---

## 📝 5. Form Standardization

### Form Layout Rule
- **2-column grid layout**
- **Label left aligned**
- **Input full width**
- **Equal spacing between rows**
- **Section spacing 20px**

### Input Field Specifications
| Element | Style |
|---------|-------|
| Label Color | `#1565C0` (Blue) |
| Label Weight | Bold |
| Input Border | 1px solid `#7fa1d6` |
| Input Focus Border | 2px solid `#1565C0` |
| Input Height | 40px |
| Error Border | 2px solid `#f44336` |
| Error Text | `#f44336`, 12px |

---

## 🧭 6. Navigation Consistency

### Sidebar Specifications
- **Background**: Blue gradient (`#1565C0` to `#1976D2`)
- **Text Color**: White
- **Active Item**: Light blue background (`#1E88E5`)
- **Hover Effect**: Subtle lightening
- **Width**: 300px fixed

---

## 👤 7. User-Friendly Display Requirements

### Implemented Features
- ✅ Clear page titles (EntryHeader / MasterHeader)
- ✅ Section separation with dividers
- ✅ Readable fonts (Segoe UI, Arial)
- ✅ Logical field arrangement
- ✅ Proper button placement (bottom right)
- ✅ Success/Error notifications
- ✅ Search bar (top right on display pages)
- ✅ Breadcrumb (added)

---

## 🧠 8. User-Friendly Usability Improvements

### Implemented Features
- ✅ Delete confirmation dialogs
- ✅ Success/Error snackbar messages
- ✅ Loading indicators during data fetch
- ✅ Disabled button while saving
- ✅ Clear validation messages
- ✅ Auto-focus on first input field
- ✅ Tab-friendly form navigation

---

## 🖥️ 9. Responsive Design

### Breakpoints
- **Desktop**: > 1024px
- **Tablet**: 768px - 1024px
- **Mobile**: < 768px

### Responsive Features
- Tables scroll horizontally on mobile
- Forms stack vertically on mobile
- Navigation drawer collapses on smaller screens

---

## 🖨️ 10. Print View Design

### Print Styles
- White background
- Black text
- Hidden navigation/headers
- Clean table formatting
- Page breaks respected

---

## 📁 UI Components Location

```
frontend/src/components/ui/
├── Layout.jsx         # Entry/Master layout components
├── Button.jsx        # Button components
├── FormFields.jsx    # Form field components
├── DataTable.jsx     # Table component
└── index.js          # Export index
```

---

## 🚀 Using the UI Components

### Importing Layout Components
```
javascript
// For Entry pages
import { 
  EntryLayout, 
  EntryHeader, 
  EntryContentWrapper, 
  EntryActionSection, 
  EntryFooter,
  SearchBar
} from './components/ui';

// For Master pages
import { 
  MasterLayout, 
  MasterHeader, 
  MasterContentWrapper, 
  MasterActionSection, 
  MasterFooter,
  SearchBar
} from './components/ui';
```

### Example: Entry Create Page
```
javascript
<EntryLayout>
  <EntryHeader title="Sales Entry Create" />
  <EntryContentWrapper>
    {/* Original HTML form - unchanged */}
    <form>
      <div className="row">
        <label>Invoice No</label>
        <input type="text" name="invoice_no" />
      </div>
    </form>
  </EntryContentWrapper>
  <EntryActionSection 
    type="create"
    showSave={true}
    onSave={handleSave}
  />
</EntryLayout>
```

### Example: Master Display Page
```
javascript
<MasterLayout>
  <MasterHeader title="Customer Display" />
  <MasterContentWrapper>
    <SearchBar value={search} onChange={setSearch} />
    {/* Original HTML table - unchanged */}
    <table className="grid-table">
      {/* Table content */}
    </table>
  </MasterContentWrapper>
  <MasterActionSection 
    type="display"
    showPrint={true}
    showRefresh={true}
    showAddNew={true}
  />
  <MasterFooter rowCount={data.length} />
</MasterLayout>
```

---

## 🔧 Routing Structure

### Entry Modules
```
/entry/advance-create
/entry/advance-display
/entry/sales-create
/entry/sales-display
/entry/purchase-create
/entry/purchase-display
... (other entry modules)
```

### Master Modules
```
/master/customer-create
/master/customer-display
/master/supplier-create
/master/supplier-display
... (other master modules)
```

---

## ✅ Checklist for New Components

When creating new components, ensure:

- [ ] Wrapped in EntryLayout or MasterLayout
- [ ] Has EntryHeader or MasterHeader with title
- [ ] Content in EntryContentWrapper or MasterContentWrapper
- [ ] Original HTML fields/table unchanged
- [ ] EntryActionSection or MasterActionSection at bottom
- [ ] EntryFooter or MasterFooter for display pages
- [ ] SearchBar for display pages
- [ ] Uses Blue (#1565C0) as primary color
- [ ] Standardized button colors
- [ ] Implements delete confirmation
- [ ] Shows loading states
- [ ] Displays success/error messages
- [ ] Has print styles

---

## 📝 Implementation Notes

### Global Styles
The `global-styles.css` file contains:
- CSS variables for theming
- Base typography
- Print styles
- Responsive breakpoints
- Utility classes

### Theme Configuration
- Primary color: `#1565C0`
- Background: `#FFFFFF`
- Card shadow: soft shadow

---

## 🔄 What Changes vs What Stays Same

### What Changes (Standardized):
| Element | Modification |
|---------|-------------|
| Spacing | Standardized (20px) |
| Button placement | Standardized (bottom right) |
| Font size | Uniform (14px) |
| Card design | Uniform (white, soft shadow) |
| Section margins | Standardized (20px) |
| Header style | Uniform (Blue gradient) |
| Search bar | Standardized (top right, 300px) |
| Table styling | Uniform (Blue header) |
| Border radius | Same everywhere (4px) |

### What Stays Same (Original HTML):
- ❌ Field order
- ❌ Field names
- ❌ Table column names
- ❌ Core logic
- ❌ Module separation (Entry / Master)
- ❌ Folder structure

---

## 📞 Support

For implementation details, refer to:
- `ERP_ENTRY_MASTER_IMPLEMENTATION_GUIDE.md` - Detailed implementation guide
- Component source files in `frontend/src/components/ui/`
- Example implementations in existing components
