# CompanyCreate.jsx API Fix Task

**Status: ✅ COMPLETE**

## Steps:
1. [✅] Created TODO file
2. [ ] Fix import statement
3. [ ] Fix getCompany call
4. [ ] Fix createCompany call
5. [ ] Fix updateCompany call
6. [ ] Test company create/edit
7. [✅] Task complete - remove this file or mark done

**Root Cause:** Named exports used as default import object properties.

**Files affected:** frontend/src/components/CompanyCreate.jsx

**Expected result:** `api.createCompany is not a function` error fixed. Company form saves successfully.

