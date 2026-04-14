# Master Display Errors Fix Plan
Status: In Progress 🚀

## Steps (Complete one by one)

- [ ] 1. Create this TODO.md ✅ **DONE**
- [x] 2. Fix AreaDisplay.jsx (add states + import) ✅ **DONE**
- [ ] 3. Update api.js (Tauri/browser detection + mocks + specific APIs)
- [ ] 4. Fix CustomerDisplay.jsx (use new api wrappers + keys)
- [ ] 5. Test all master displays: `npm run dev`
- [ ] 6. Check console: No more errors
- [ ] 7. Test Tauri build
- [ ] 8. Mark complete & attempt_completion

## Priority
1. AreaDisplay.jsx (quick crash fix)
2. api.js (fixes 90% errors)
3. CustomerDisplay.jsx (specific function fix)

## Expected Result
✅ No `setMessage` errors
✅ No `api.getCustomers` errors  
✅ No `command not found` (mocked)
✅ All master displays load in browser

**Next Step:** Fix AreaDisplay.jsx
