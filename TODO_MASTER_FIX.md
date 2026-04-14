# MASTER MODULES COMPLETE FIX - Tauri + React ERP
Tracking progress for all 18 modules CREATE/DISPLAY/DELETE.

## EXECUTION ORDER (STRICT - DO NOT SKIP)

### 🔥 STEP 1: DATABASE (MANDATORY FIRST) ✓
- [x] Add `godown_master` table to `database/schema.sql`
  \`\`\`sql
  CREATE TABLE godown_master (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      godown_name TEXT UNIQUE,
      print_name TEXT,
      location TEXT,
      status TEXT DEFAULT 'Active'
  );
  \`\`\`
- [x] Add DB reset at end of schema.sql
  ```sql
  CREATE TABLE godown_master (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      godown_name TEXT UNIQUE,
      print_name TEXT,
      location TEXT,
      status TEXT DEFAULT 'Active'
  );
  ```
- [ ] Add DB reset at end of schema.sql:
  ```sql
  DELETE FROM item_master; DELETE FROM area_master; ... (all masters)
  ```
- [ ] Run schema recreation (execute_command if DB reset needed)

### 🔥 STEP 2: FRONTEND CORE
- [ ] fetchWrapper.js - DELETE or keep disabled ✓ (done)
- [ ] Remove all `tauriApi`, `executeQuery` imports/uses
- [ ] Verify api.js standard ✓ (done)

### 🔥 STEP 3: GODOWN MODULE (TEST MODULE) ✓\n- [x] GodownCreate.jsx: `{godown_name: formData.name}` to `godown_master`\n- [ ] GodownDisplay.jsx: `api.getMasters("godowns")`, `api.deleteMaster("godown_master", id)` ✓
- [ ] GodownDisplay.jsx: `api.getMasters("godowns")`, `api.deleteMaster("godown_master", id)`
- [ ] Test: Create → Display → Delete

### 🔥 STEP 4: ITEM MODULE ✓\n- [x] ItemDisplay.jsx: Add `import React, { useState, useEffect }`\n- [x] Verify ItemCreate: `{item_name}` ✓
- [ ] Verify ItemCreate: `{item_name}`
- [ ] Test: Create → Display → Delete

### 🔥 STEP 5: BULK FIX OTHER MODULES
Priority from open tabs/search:
- [ ] AreaCreate/Display (`area_master`, `{name}`)
- [ ] CityCreate/Display (`city_master`, `{name}`)
- [ ] SupplierCreate/Display (`supplier_master`, `{name}`)
- [ ] CustomerCreate/Display (`customer_master`, `{name}`)
- [ ] CompanyDisplay (`companies`)
- [ ] ConsigneeDisplay etc. (remove tauriApi)
- [ ] All others via search_files for `tauriApi|executeQuery`

### 🔥 STEP 6: REACT FIXES
- [ ] All Display.jsx: `import React, { useState, useEffect } from "react";`

### 🔥 STEP 7: TAURI (OPTIONAL) ✓\n- [x] tauri.conf.json: Add dialog plugin

### 🔥 STEP 8: FINAL TESTS
- [ ] All 18 modules: Create/Display/Delete
- [ ] Dropdowns in Entry pages populate
- [ ] No console errors

## Progress\nCurrent: Godown/Item fixed, DB schema updated, bulk Displays good (Area/Company/Supplier/City have React imports & api ✓). Ready for test after Tauri restart.

**Updated when step complete.**

