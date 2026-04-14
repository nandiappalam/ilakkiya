# ERP System - Running Instructions

## Quick Fix for 404/500 Errors

If you're getting 404 or 500 errors when using the ERP:

### Step 1: Restart Backend
```
bash
cd d:/BVC HTML/backend
node server.js
```

### Step 2: Restart Frontend (in a new terminal)
```
bash
cd d:/BVC HTML/frontend
npm run dev
```

### Step 3: Clear Browser Cache
Press `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac) to hard refresh.

---

## API Endpoints

### Backend runs on: http://localhost:3000

### Master APIs:
| Endpoint | Description |
|----------|-------------|
| `GET /api/masters/items` | Get active items |
| `POST /api/masters/record/item_master` | Create item |
| `GET /api/masters/all/item_master` | Get all items |
| `PUT /api/masters/record/item_master/:id` | Update item |
| `DELETE /api/masters/record/item_master/:id` | Delete item |

### Stock APIs:
| Endpoint | Description |
|----------|-------------|
| `GET /api/stock` | Get all stock |
| `GET /api/stock/report` | Stock report |
| `POST /api/stock` | Add stock (purchase) |
| `POST /api/stock/deduct` | Deduct stock (sales) |

---

## Testing the API

Test from terminal (backend must be running):
```
bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/masters/items
```

---

## Common Issues

### Issue: "404 Not Found" on API calls
- **Cause**: Frontend is hitting Vite (5173) instead of Backend (3000)
- **Fix**: Check vite.config.js proxy settings, restart both servers

### Issue: "500 Internal Server Error"
- **Cause**: Database error or missing table
- **Fix**: Run `node init_all_routes.js` in backend folder

### Issue: Old data showing
- **Cause**: Browser cache
- **Fix**: Hard refresh (Ctrl+Shift+R)
