# BVC ERP - Running Instructions

## Browser Development (Mocks, No Persistence)
```
cd frontend
npm run dev
```
- Companies: "Test Co" only
- No DB saves
- Good for UI testing

## Full Tauri Desktop App (Real DB)
```
# Install Tauri CLI
cargo install tauri-cli

# Development
cd src-tauri
cargo tauri dev

# Build standalone EXE
cargo tauri build
```

**Login:** admin/admin123

**Your old companies restored** (ABC, ACD, ASM, BTS, BVC, asm) - visible in Tauri only.

**Why browser shows only Test Co?** Pure JS mocks for dev. Tauri loads SQLite DB.

Original 500 error fixed ✅
