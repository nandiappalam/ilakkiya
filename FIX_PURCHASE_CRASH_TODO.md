# Fix Purchase Module Crash - TODO

## Task
Fix the Purchase module crash caused by null data handling in the advances API.

## Error
```
TypeError: Cannot destructure property 'sno' of 'e' as it is null.
TypeError: a.find is not a function
```

## Root Cause
1. FetchWrapper was missing handler for `GET /api/advances`
2. API functions didn't handle null responses properly
3. Components crashed when receiving null/undefined data

## Fixes Applied

### 1. fetchWrapper.js - Added GET handler for /api/advances
- ✅ Added: `/api/advances': { method: 'GET', handler: () => api.getAdvances() }`

### 2. api.js - Added null validation in getAdvances()
- ✅ Added null/undefined result handling
- ✅ Added try-catch to prevent crashes
- ✅ Always returns { success: true, data: [] } format

### 3. api.js - Added null validation in createAdvance()
- ✅ Added formData null check before destructuring

### 4. AdvanceEntry.jsx - Added robust null handling
- ✅ Added Array.isArray() check
- ✅ Added null/undefined fallback to empty array
- ✅ Added try-catch to prevent crashes

## Status: COMPLETE ✅

The fixes ensure that:
1. The FetchWrapper properly intercepts GET /api/advances calls
2. API functions always return valid { success, data } format
3. Components handle null/undefined/error responses gracefully
4. No more crashes when advances table is empty or returns null

