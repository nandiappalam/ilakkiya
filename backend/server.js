const express = require('express')
const cors = require('cors')
const path = require('path')
const https = require('https')
const crypto = require('crypto')
const fs = require('fs')
const db = require('./config/database')

const app = express()
// Use PORT 3000 for development mode
// For Tauri embedded mode, this can be changed to 0
const PORT = process.env.PORT || 3000
let actualPort = PORT

// Middleware
app.use(cors())
app.use(express.json())
const frontendPath = path.join(__dirname, '../frontend/dist')

// Serve static frontend files
if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath, {
  index: false
}));
}
// API routes FIRST
// (your existing routes here)

// React fallback ONLY for non-API routes
/*app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ message: 'API route not found' });
  }

  const indexPath = path.join(frontendPath, 'index.html');

  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send('Frontend not built. API is running.');
  }
});*/
app.use('/Entry', express.static(path.join(__dirname, '../Entry')))

// Routes
const purchasesRouter = require('./routes/purchases')
const purchaseReturnsRouter = require('./routes/purchaseReturns')
const grainsRouter = require('./routes/grains')
const flourOutRouter = require('./routes/flourOut')
const flourOutReturnsRouter = require('./routes/flourOutReturns')
const salesRouter = require('./routes/sales')
const salesReturnsRouter = require('./routes/salesReturns')
const mastersRouter = require('./routes/masters')
const advancesRouter = require('./routes/advances')
const papadInRouter = require('./routes/papadIn')
const stockRouter = require('./routes/stock')
const reportsRouter = require('./routes/reports')
const weightConversionRouter = require('./routes/weightConversion')
const salesExportOrdersRouter = require('./routes/salesExportOrders')
const openRouter = require('./routes/open')
const companiesRouter = require('./routes/companies')
const authRouter = require('./routes/auth')
const dbRouter = require('./routes/db')

app.use('/api/purchases', purchasesRouter)
app.use('/api/purchase-returns', purchaseReturnsRouter)
app.use('/api/grains', grainsRouter)
app.use('/api/flour-out', flourOutRouter)
app.use('/api/flour-out-returns', flourOutReturnsRouter)
// Alias for flour-out-return (without 's') - used by some frontend components
app.use('/api/flour-out-return', flourOutReturnsRouter)
app.use('/api/sales', salesRouter)
app.use('/api/sales-returns', salesReturnsRouter)
app.use('/api/masters', mastersRouter)
app.use('/api/advances', advancesRouter)
// Alias for advance (without 's') - used by some frontend components
app.use('/api/advance', advancesRouter)
app.use('/api/papad-in', papadInRouter)
app.use('/api/stock', stockRouter)
app.use('/api/reports', reportsRouter)
app.use('/api/weight-conversion', weightConversionRouter)
app.use('/api/sales-export-orders', salesExportOrdersRouter)
app.use('/api/open', openRouter)

// Accounts Reports API - Mounted under /api/accounts
app.use('/api/accounts', reportsRouter)

// Companies and Auth API
app.use('/api/companies', companiesRouter)
app.use('/api/auth', authRouter)

// Database query API (for Tauri-style queries)
app.use('/api/db', dbRouter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'BVC Purchase Management API is running' })
})

// Serve React app for any unmatched routes
/*app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, '../frontend/dist/index.html')

  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath)
  } else {
    res.send('Frontend not built. API is running.')
  }
})*/

app.use(express.static(frontendPath));

// Serve React app for any unmatched routes
app.get('*', (req, res) => {
  // Ignore API routes
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ message: 'API route not found' });
  }

  const indexPath = path.join(frontendPath, 'index.html');

  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }

  res.send('Frontend not built. API is running.');
});
  // Let static files pass through (IMPORTANT)
 /* const filePath = path.join(frontendPath, req.path);
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }

  // React fallback
  const indexPath = path.join(frontendPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }*/

 // res.send('Frontend not built. API is running.');

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Something went wrong!' })
})

// Initialize master tables on startup
async function initializeMasterTables() {
  console.log('Initializing master tables...')
  
  const tables = [
    {
      name: 'item_master',
      sql: `CREATE TABLE IF NOT EXISTS item_master (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_code TEXT UNIQUE,
        item_name TEXT,
        print_name TEXT,
        item_group TEXT,
        tax REAL DEFAULT 0,
        hsn_code TEXT,
        status TEXT DEFAULT 'Active'
      )`
    },
    {
      name: 'item_groups',
      sql: `CREATE TABLE IF NOT EXISTS item_groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        group_code TEXT UNIQUE,
        group_name TEXT,
        print_name TEXT,
        tax REAL
      )`
    },
    {
      name: 'customer_master',
      sql: `CREATE TABLE IF NOT EXISTS customer_master (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        print_name TEXT,
        contact_person TEXT,
        address1 TEXT,
        address2 TEXT,
        address3 TEXT,
        address4 TEXT,
        gst_number TEXT,
        phone_off TEXT,
        phone_res TEXT,
        mobile1 TEXT,
        mobile2 TEXT,
        area TEXT,
        opening_balance REAL DEFAULT 0,
        status TEXT DEFAULT 'Active'
      )`
    },
    {
      name: 'supplier_master',
      sql: `CREATE TABLE IF NOT EXISTS supplier_master (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        print_name TEXT,
        contact_person TEXT,
        address1 TEXT,
        address2 TEXT,
        address3 TEXT,
        address4 TEXT,
        gst_number TEXT,
        phone_off TEXT,
        phone_res TEXT,
        mobile1 TEXT,
        mobile2 TEXT,
        area TEXT,
        opening_balance REAL DEFAULT 0,
        status TEXT DEFAULT 'Active'
      )`
    },
    {
      name: 'area_master',
      sql: `CREATE TABLE IF NOT EXISTS area_master (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        print_name TEXT,
        status TEXT DEFAULT 'Active'
      )`
    },
    {
      name: 'city_master',
      sql: `CREATE TABLE IF NOT EXISTS city_master (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        print_name TEXT,
        status TEXT DEFAULT 'Active'
      )`
    },
    {
      name: 'transport_master',
      sql: `CREATE TABLE IF NOT EXISTS transport_master (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        print_name TEXT,
        status TEXT DEFAULT 'Active'
      )`
    },
    {
      name: 'weightmaster',
      sql: `CREATE TABLE IF NOT EXISTS weightmaster (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        printname TEXT,
        weight REAL
      )`
    },
    {
      name: 'ledgergroupmaster',
      sql: `CREATE TABLE IF NOT EXISTS ledgergroupmaster (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        printname TEXT,
        under TEXT
      )`
    },
    {
      name: 'ledgermaster',
      sql: `CREATE TABLE IF NOT EXISTS ledgermaster (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        printname TEXT,
        under TEXT,
        openingbalance REAL DEFAULT 0,
        area TEXT,
        credit REAL DEFAULT 0,
        debit REAL DEFAULT 0,
        status TEXT DEFAULT 'Active'
      )`
    },
    {
      name: 'deduction_sales',
      sql: `CREATE TABLE IF NOT EXISTS deduction_sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ded_code TEXT UNIQUE,
        ded_name TEXT,
        print_name TEXT,
        adjust_with_sales TEXT,
        account_head TEXT,
        ded_type TEXT,
        calc_type TEXT,
        ded_value REAL DEFAULT 0,
        status TEXT DEFAULT 'Active'
      )`
    },
    {
      name: 'deduction_purchase',
      sql: `CREATE TABLE IF NOT EXISTS deduction_purchase (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ded_code TEXT UNIQUE,
        ded_name TEXT,
        print_name TEXT,
        debit_adjust TEXT,
        account_head TEXT,
        credit_adjust TEXT,
        ded_type TEXT,
        calc_type TEXT,
        status TEXT DEFAULT 'Active'
      )`
    },
    {
      name: 'flour_mill_master',
      sql: `CREATE TABLE IF NOT EXISTS flour_mill_master (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        flourmill TEXT UNIQUE,
        print_name TEXT,
        contact_person TEXT,
        address1 TEXT,
        address2 TEXT,
        address3 TEXT,
        address4 TEXT,
        gst_number TEXT,
        phone_off TEXT,
        phone_res TEXT,
        mobile1 TEXT,
        mobile2 TEXT,
        area TEXT,
        wages_kg REAL DEFAULT 0,
        opening_balance REAL DEFAULT 0,
        status TEXT DEFAULT 'Active'
      )`
    },
    {
      name: 'papad_company_master',
      sql: `CREATE TABLE IF NOT EXISTS papad_company_master (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        print_name TEXT,
        contact_person TEXT,
        address1 TEXT,
        address2 TEXT,
        address3 TEXT,
        address4 TEXT,
        gst_no TEXT,
        phone_off TEXT,
        phone_res TEXT,
        mobile1 TEXT,
        mobile2 TEXT,
        area TEXT,
        wages_kg REAL DEFAULT 0,
        opening_balance REAL DEFAULT 0,
        opening_advance REAL DEFAULT 0,
        status TEXT DEFAULT 'Active'
      )`
    },
    {
      name: 'consignee_group_master',
      sql: `CREATE TABLE IF NOT EXISTS consignee_group_master (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        print_name TEXT,
        contact_person TEXT,
        address TEXT,
        area TEXT,
        phone_res TEXT,
        phone_off TEXT,
        mobile TEXT,
        tin_no TEXT,
        status TEXT DEFAULT 'Active'
      )`
    },
    {
      name: 'sender_group_master',
      sql: `CREATE TABLE IF NOT EXISTS sender_group_master (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        print_name TEXT,
        contact_person TEXT,
        address TEXT,
        area TEXT,
        phone_res TEXT,
        phone_off TEXT,
        mobile TEXT,
        tin_no TEXT,
        status TEXT DEFAULT 'Active'
      )`
    },
    {
      name: 'ptrans_master',
      sql: `CREATE TABLE IF NOT EXISTS ptrans_master (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        print_name TEXT,
        status TEXT DEFAULT 'Active'
      )`
    },
    {
      name: 'stock',
      sql: `CREATE TABLE IF NOT EXISTS stock (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT,
        item_id INTEGER,
        item_name TEXT,
        lot_no TEXT,
        qty REAL DEFAULT 0,
        rate REAL DEFAULT 0,
        type TEXT,
        status TEXT DEFAULT 'Active'
      )`
    },
    {
      name: 'companies',
      sql: `CREATE TABLE IF NOT EXISTS companies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        address TEXT,
        gst_number TEXT,
        contact TEXT,
        email TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    },
    {
      name: 'users',
      sql: `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        company_id INTEGER,
        status TEXT DEFAULT 'Active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    }
  ]

  for (const table of tables) {
    try {
      await db.run(table.sql)
      console.log(`✓ Table '${table.name}' is ready`)
    } catch (error) {
      console.log(`✗ Error creating table '${table.name}':`, error.message)
    }
  }
  
  // Verify tables
  try {
    const result = await db.query("SELECT name FROM sqlite_master WHERE type='table'")
    console.log('Available tables:', result.rows.map(r => r.name).join(', '))
  } catch (error) {
    console.log('Error verifying tables:', error.message)
  }
}

// Start server after initialization
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`HTTP Server is running on port ${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/api/health`)
  console.log(`Network access: http://0.0.0.0:${PORT}/api/health`)
  
  // Initialize master tables
  await initializeMasterTables()
})

module.exports = app

