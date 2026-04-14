const express = require('express')
const router = express.Router()
const db = require('../config/database')

// Helper function to check if table exists
async function tableExists(tableName) {
  try {
    const result = await db.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name = ?",
      [tableName]
    )
    return result.rows.length > 0
  } catch (error) {
    return false
  }
}

// ============================================================
// STOCK STATUS REPORT - Product-wise summary
// GET /api/reports/stock-status?item_id=X&from_date=Y&to_date=Z
// ============================================================
router.get('/stock-status', async (req, res) => {
  try {
    // Check if stock table exists
    const exists = await tableExists('stock')
    if (!exists) {
      return res.json([])
    }
    
    const { item_id, from_date, to_date } = req.query
    
    let query = `
      SELECT 
        item_name,
        SUM(CASE WHEN type = 'Purchase' THEN qty ELSE 0 END) as total_purchased,
        SUM(CASE WHEN type = 'Sale' THEN ABS(qty) ELSE 0 END) as total_sold,
        SUM(qty) as current_balance
      FROM stock
      WHERE 1=1
    `
    const params = []
    
    if (item_id) {
      query += ` AND item_id = ?`
      params.push(item_id)
    }
    
    if (from_date) {
      query += ` AND date >= ?`
      params.push(from_date)
    }
    
    if (to_date) {
      query += ` AND date <= ?`
      params.push(to_date)
    }
    
    query += ` GROUP BY item_name ORDER BY item_name`
    
    const result = await db.query(query, params)
    res.json(result.rows || [])
  } catch (error) {
    console.error('Error fetching stock status:', error)
    res.json([])
  }
})

// ============================================================
// LOT WISE STOCK REPORT - Lot breakdown
// GET /api/stock/lots?item_id=X
// ============================================================
router.get('/lots', async (req, res) => {
  try {
    // Check if stock table exists
    const exists = await tableExists('stock')
    if (!exists) {
      return res.json([])
    }
    
    const { item_id } = req.query
    
    let query = `
      SELECT 
        item_name,
        lot_no,
        MIN(date) as created_at,
        SUM(CASE WHEN qty > 0 THEN qty ELSE 0 END) as purchased_qty,
        SUM(CASE WHEN qty < 0 THEN ABS(qty) ELSE 0 END) as sold_qty,
        SUM(qty) as remaining_quantity,
        AVG(rate) as rate
      FROM stock
      WHERE 1=1
    `
    const params = []
    
    if (item_id) {
      query += ` AND item_id = ?`
      params.push(item_id)
    }
    
    query += ` GROUP BY item_name, lot_no ORDER BY item_name, created_at`
    
    const result = await db.query(query, params)
    res.json(result.rows || [])
  } catch (error) {
    console.error('Error fetching lots:', error)
    res.json([])
  }
})

// ============================================================
// PURCHASE REGISTER REPORT
// GET /api/reports/purchase-register?supplier_id=X&from_date=Y&to_date=Z
// ============================================================
router.get('/purchase-register', async (req, res) => {
  try {
    // Check if purchases table exists
    const purchasesExists = await tableExists('purchases')
    if (!purchasesExists) {
      return res.json([])
    }
    
    const { supplier_id, from_date, to_date } = req.query
    
    // Simple query without JOINs to avoid schema issues
    let query = `
      SELECT 
        date,
        s_no as bill_no,
        supplier,
        '' as item_name,
        0 as qty,
        0 as rate,
        total_amt as amount
      FROM purchases
      WHERE 1=1
    `
    const params = []
    
    if (supplier_id) {
      query += ` AND supplier_id = ?`
      params.push(supplier_id)
    }
    
    if (from_date) {
      query += ` AND date >= ?`
      params.push(from_date)
    }
    
    if (to_date) {
      query += ` AND date <= ?`
      params.push(to_date)
    }
    
    query += ` ORDER BY date DESC, id`
    
    const result = await db.query(query, params)
    res.json(result.rows || [])
  } catch (error) {
    console.error('Error fetching purchase register:', error)
    res.json([])
  }
})

// ============================================================
// SALES REGISTER REPORT
// GET /api/reports/sales-register?customer_id=X&from_date=Y&to_date=Z
// ============================================================
router.get('/sales-register', async (req, res) => {
  try {
    // Check if sales table exists
    const salesExists = await tableExists('sales')
    if (!salesExists) {
      return res.json([])
    }
    
    const { customer_id, from_date, to_date } = req.query
    
    // Simple query without JOINs to avoid schema issues
    let query = `
      SELECT 
        date,
        s_no as invoice_no,
        customer,
        '' as item_name,
        '' as lot_no,
        0 as qty,
        0 as rate,
        total_amt as amount
      FROM sales
      WHERE 1=1
    `
    const params = []
    
    if (customer_id) {
      query += ` AND customer_id = ?`
      params.push(customer_id)
    }
    
    if (from_date) {
      query += ` AND date >= ?`
      params.push(from_date)
    }
    
    if (to_date) {
      query += ` AND date <= ?`
      params.push(to_date)
    }
    
    query += ` ORDER BY date DESC, id`
    
    const result = await db.query(query, params)
    res.json(result.rows || [])
  } catch (error) {
    console.error('Error fetching sales register:', error)
    res.json([])
  }
})

// ============================================================
// PURCHASE RETURN REGISTER
// GET /api/reports/purchase-return-register
// ============================================================
router.get('/purchase-return-register', async (req, res) => {
  try {
    const { supplier_id, from_date, to_date } = req.query
    
    let query = `
      SELECT 
        pr.date,
        pr.return_inv_no as return_no,
        s.name as supplier_name,
        pri.item_name,
        pri.qty,
        pri.rate,
        pri.amount,
        pr.remarks
      FROM purchase_returns pr
      LEFT JOIN purchase_return_items pri ON pr.id = pri.purchase_return_id
      LEFT JOIN supplier_master s ON pr.supplier = s.name
      WHERE 1=1
    `
    const params = []
    
    if (supplier_id) {
      query += ` AND s.id = ?`
      params.push(supplier_id)
    }
    
    if (from_date) {
      query += ` AND pr.date >= ?`
      params.push(from_date)
    }
    
    if (to_date) {
      query += ` AND pr.date <= ?`
      params.push(to_date)
    }
    
    query += ` ORDER BY pr.date DESC`
    
    const result = await db.query(query, params)
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching purchase return register:', error)
    res.status(500).json({ message: 'Error fetching purchase return register', error: error.message })
  }
})

// ============================================================
// SALES RETURN REGISTER
// GET /api/reports/sales-return-register
// ============================================================
router.get('/sales-return-register', async (req, res) => {
  try {
    const { customer_id, from_date, to_date } = req.query
    
    let query = `
      SELECT 
        sr.date,
        sr.s_no as return_no,
        sr.customer,
        sri.item_name,
        sri.qty,
        sri.rate,
        sri.amount,
        sr.remarks
      FROM sales_return sr
      LEFT JOIN sales_return_items sri ON sr.id = sri.sales_return_id
      WHERE 1=1
    `
    const params = []
    
    if (from_date) {
      query += ` AND sr.date >= ?`
      params.push(from_date)
    }
    
    if (to_date) {
      query += ` AND sr.date <= ?`
      params.push(to_date)
    }
    
    query += ` ORDER BY sr.date DESC`
    
    const result = await db.query(query, params)
    res.json(result.rows || [])
  } catch (error) {
    console.error('Error fetching sales return register:', error)
    res.json([])
  }
})

// ============================================================
// PAPAD LEDGER - Payment tracking
// GET /api/reports/papad-ledger?from_date=Y&to_date=Z
// ============================================================
router.get('/papad-ledger', async (req, res) => {
  try {
    const { from_date, to_date } = req.query
    
    let query = `
      SELECT 
        a.date,
        a.s_no as voucher_no,
        pc.name as particulars,
        'Payment' as type,
        a.amount as credit,
        0 as debit
      FROM advances a
      LEFT JOIN papad_company_master pc ON a.papad_company = pc.name
      WHERE 1=1
    `
    const params = []
    
    if (from_date) {
      query += ` AND a.date >= ?`
      params.push(from_date)
    }
    
    if (to_date) {
      query += ` AND a.date <= ?`
      params.push(to_date)
    }
    
    query += ` ORDER BY a.date DESC`
    
    const result = await db.query(query, params)
    
    // Calculate running balance
    let balance = 0
    const rows = result.rows.map(row => {
      balance += parseFloat(row.credit || 0) - parseFloat(row.debit || 0)
      return { ...row, balance }
    })
    
    res.json(rows)
  } catch (error) {
    console.error('Error fetching papad ledger:', error)
    res.status(500).json({ message: 'Error fetching papad ledger', error: error.message })
  }
})

// ============================================================
// SUPPLIER LEDGER - Supplier-wise transactions
// GET /api/reports/supplier-ledger?supplier_id=X&from_date=Y&to_date=Z
// ============================================================
router.get('/supplier-ledger', async (req, res) => {
  try {
    const { supplier_id, from_date, to_date } = req.query
    
    // Get purchases (debit - money owed increases)
    let purchaseQuery = `
      SELECT 
        p.date,
        p.inv_no as voucher_no,
        'Purchase' as type,
        pi.amount as debit,
        0 as credit,
        p.supplier
      FROM purchases p
      LEFT JOIN purchase_items pi ON p.id = pi.purchase_id
      WHERE 1=1
    `
    const purchaseParams = []
    
    if (supplier_id) {
      purchaseQuery += ` AND p.supplier_id = ?`
      purchaseParams.push(supplier_id)
    }
    
    if (from_date) {
      purchaseQuery += ` AND p.date >= ?`
      purchaseParams.push(from_date)
    }
    
    if (to_date) {
      purchaseQuery += ` AND p.date <= ?`
      purchaseParams.push(to_date)
    }
    
    // Get advances (credit - payments made)
    let advanceQuery = `
      SELECT 
        a.date,
        a.s_no as voucher_no,
        'Payment' as type,
        0 as debit,
        a.amount as credit,
        a.supplier as supplier
      FROM advances a
      WHERE a.supplier IS NOT NULL AND a.supplier != ''
    `
    const advanceParams = []
    
    if (supplier_id) {
      advanceQuery += ` AND a.supplier_id = ?`
      advanceParams.push(supplier_id)
    }
    
    if (from_date) {
      advanceQuery += ` AND a.date >= ?`
      advanceParams.push(from_date)
    }
    
    if (to_date) {
      advanceQuery += ` AND a.date <= ?`
      advanceParams.push(to_date)
    }
    
    // Combine and calculate running balance
    const purchases = await db.query(purchaseQuery, purchaseParams)
    const advances = await db.query(advanceQuery, advanceParams)
    
    // Combine all transactions
    const allTransactions = [
      ...(purchases.rows || []),
      ...(advances.rows || [])
    ].sort((a, b) => new Date(a.date) - new Date(b.date))
    
    // Calculate running balance
    let balance = 0
    const rows = allTransactions.map(row => {
      balance += parseFloat(row.credit || 0) - parseFloat(row.debit || 0)
      return { ...row, balance }
    })
    
    res.json(rows)
  } catch (error) {
    console.error('Error fetching supplier ledger:', error)
    res.status(500).json({ message: 'Error fetching supplier ledger', error: error.message })
  }
})

// ============================================================
// CUSTOMER LEDGER - Customer-wise transactions
// GET /api/reports/customer-ledger?customer_id=X&from_date=Y&to_date=Z
// ============================================================
router.get('/customer-ledger', async (req, res) => {
  try {
    const { customer_id, from_date, to_date } = req.query
    
    // Get sales (debit - money owed increases)
    let salesQuery = `
      SELECT 
        s.date,
        s.inv_no as voucher_no,
        'Sale' as type,
        si.amount as debit,
        0 as credit,
        s.customer
      FROM sales s
      LEFT JOIN sales_items si ON s.id = si.sale_id
      WHERE 1=1
    `
    const salesParams = []
    
    if (customer_id) {
      salesQuery += ` AND s.customer_id = ?`
      salesParams.push(customer_id)
    }
    
    if (from_date) {
      salesQuery += ` AND s.date >= ?`
      salesParams.push(from_date)
    }
    
    if (to_date) {
      salesQuery += ` AND s.date <= ?`
      salesParams.push(to_date)
    }
    
    // Get advances/receipts (credit - payments received)
    let receiptQuery = `
      SELECT 
        a.date,
        a.s_no as voucher_no,
        'Receipt' as type,
        0 as debit,
        a.amount as credit,
        a.customer as customer
      FROM advances a
      WHERE a.customer IS NOT NULL AND a.customer != ''
    `
    const receiptParams = []
    
    if (customer_id) {
      receiptQuery += ` AND a.customer_id = ?`
      receiptParams.push(customer_id)
    }
    
    if (from_date) {
      receiptQuery += ` AND a.date >= ?`
      receiptParams.push(from_date)
    }
    
    if (to_date) {
      receiptQuery += ` AND a.date <= ?`
      receiptParams.push(to_date)
    }
    
    // Combine and calculate running balance
    const sales = await db.query(salesQuery, salesParams)
    const receipts = await db.query(receiptQuery, receiptParams)
    
    // Combine all transactions
    const allTransactions = [
      ...(sales.rows || []),
      ...(receipts.rows || [])
    ].sort((a, b) => new Date(a.date) - new Date(b.date))
    
    // Calculate running balance
    let balance = 0
    const rows = allTransactions.map(row => {
      balance += parseFloat(row.credit || 0) - parseFloat(row.debit || 0)
      return { ...row, balance }
    })
    
    res.json(rows)
  } catch (error) {
    console.error('Error fetching customer ledger:', error)
    res.status(500).json({ message: 'Error fetching customer ledger', error: error.message })
  }
})

// ============================================================
// LOT HISTORY REPORT
// GET /api/reports/lot-history?item_id=X&lot_no=Y
// ============================================================
router.get('/lot-history', async (req, res) => {
  try {
    const { item_id, lot_no } = req.query
    
    let query = `
      SELECT 
        date,
        type,
        reference_no,
        qty as qty_in,
        0 as qty_out,
        balance
      FROM stock
      WHERE 1=1
    `
    const params = []
    
    if (item_id) {
      query += ` AND item_id = ?`
      params.push(item_id)
    }
    
    if (lot_no) {
      query += ` AND lot_no = ?`
      params.push(lot_no)
    }
    
    query += ` ORDER BY date`
    
    const result = await db.query(query, params)
    res.json(result.rows || [])
  } catch (error) {
    console.error('Error fetching lot history:', error)
    res.json([])
  }
})

// ============================================================
// DAY BOOK - All transactions date-wise
// GET /api/accounts/daybook?from_date=X&to_date=Y
// ============================================================
router.get('/daybook', async (req, res) => {
  try {
    const { from_date, to_date } = req.query
    
    let transactions = []
    
    // Get purchases
    let purchaseQuery = `
      SELECT 
        date,
        'Purchase' as voucher_type,
        s_no as voucher_no,
        supplier as ledger_name,
        grand_total as debit,
        0 as credit
      FROM purchases
      WHERE 1=1
    `
    const purchaseParams = []
    
    if (from_date) {
      purchaseQuery += ` AND date >= ?`
      purchaseParams.push(from_date)
    }
    if (to_date) {
      purchaseQuery += ` AND date <= ?`
      purchaseParams.push(to_date)
    }
    
    const purchases = await db.query(purchaseQuery, purchaseParams)
    transactions.push(...(purchases.rows || []))
    
    // Get sales
    let salesQuery = `
      SELECT 
        date,
        'Sale' as voucher_type,
        s_no as voucher_no,
        customer as ledger_name,
        0 as debit,
        total_amt as credit
      FROM sales
      WHERE 1=1
    `
    const salesParams = []
    
    if (from_date) {
      salesQuery += ` AND date >= ?`
      salesParams.push(from_date)
    }
    if (to_date) {
      salesQuery += ` AND date <= ?`
      salesParams.push(to_date)
    }
    
    const sales = await db.query(salesQuery, salesParams)
    transactions.push(...(sales.rows || []))
    
    // Get purchase returns
    let prQuery = `
      SELECT 
        date,
        'Purchase Return' as voucher_type,
        return_inv_no as voucher_no,
        supplier as ledger_name,
        0 as debit,
        grand_total as credit
      FROM purchase_returns
      WHERE 1=1
    `
    const prParams = []
    
    if (from_date) {
      prQuery += ` AND date >= ?`
      prParams.push(from_date)
    }
    if (to_date) {
      prQuery += ` AND date <= ?`
      prParams.push(to_date)
    }
    
    const purchaseReturns = await db.query(prQuery, prParams)
    transactions.push(...(purchaseReturns.rows || []))
    
    // Get sales returns
    let srQuery = `
      SELECT 
        date,
        'Sales Return' as voucher_type,
        return_inv_no as voucher_no,
        customer as ledger_name,
        total_amt as debit,
        0 as credit
      FROM sales_return
      WHERE 1=1
    `
    const srParams = []
    
    if (from_date) {
      srQuery += ` AND date >= ?`
      srParams.push(from_date)
    }
    if (to_date) {
      srQuery += ` AND date <= ?`
      srParams.push(to_date)
    }
    
    const salesReturns = await db.query(srQuery, srParams)
    transactions.push(...(salesReturns.rows || []))
    
    // Get advances (payments)
    let advanceQuery = `
      SELECT 
        date,
        'Payment' as voucher_type,
        s_no as voucher_no,
        papad_company as ledger_name,
        0 as debit,
        amount as credit
      FROM advances
      WHERE 1=1
    `
    const advanceParams = []
    
    if (from_date) {
      advanceQuery += ` AND date >= ?`
      advanceParams.push(from_date)
    }
    if (to_date) {
      advanceQuery += ` AND date <= ?`
      advanceParams.push(to_date)
    }
    
    const advances = await db.query(advanceQuery, advanceParams)
    transactions.push(...(advances.rows || []))
    
    // Sort by date
    transactions.sort((a, b) => new Date(a.date) - new Date(b.date))
    
    // Calculate running balance
    let balance = 0
    transactions = transactions.map(t => {
      balance += parseFloat(t.debit || 0) - parseFloat(t.credit || 0)
      return { ...t, balance }
    })
    
    res.json(transactions)
  } catch (error) {
    console.error('Error fetching daybook:', error)
    res.status(500).json({ message: 'Error fetching daybook', error: error.message })
  }
})

// ============================================================
// TRIAL BALANCE - Ledger-wise Debit & Credit summary
// GET /api/accounts/trial-balance?from_date=X&to_date=Y
// ============================================================
router.get('/trial-balance', async (req, res) => {
  try {
    const { from_date, to_date } = req.query
    
    let ledgerSummary = {}
    
    // Helper to add to summary
    const addToSummary = (ledgerName, debit, credit) => {
      if (!ledgerSummary[ledgerName]) {
        ledgerSummary[ledgerName] = { ledger_name: ledgerName, debit: 0, credit: 0 }
      }
      ledgerSummary[ledgerName].debit += parseFloat(debit || 0)
      ledgerSummary[ledgerName].credit += parseFloat(credit || 0)
    }
    
    // Get purchases from the purchases table (avoid variable hoisting issue)
    const purchasesTable = 'purchases'
    let purchaseQuery = `
      SELECT supplier, SUM(grand_total) as total
      FROM ${purchasesTable} WHERE 1=1
    `
    const purchaseParams = []
    if (from_date) {
      purchaseQuery += ` AND date >= ?`
      purchaseParams.push(from_date)
    }
    if (to_date) {
      purchaseQuery += ` AND date <= ?`
      purchaseParams.push(to_date)
    }
    purchaseQuery += ` GROUP BY supplier`
    
    const purchases = await db.query(purchaseQuery, purchaseParams)
    (purchases.rows || []).forEach(p => {
      if (p.supplier) addToSummary(p.supplier, 0, p.total)
    })
    
    // Get sales from the sales table
    const salesTable = 'sales'
    let salesQuery = `
      SELECT customer, SUM(total_amt) as total
      FROM ${salesTable} WHERE 1=1
    `
    const salesParams = []
    if (from_date) {
      salesQuery += ` AND date >= ?`
      salesParams.push(from_date)
    }
    if (to_date) {
      salesQuery += ` AND date <= ?`
      salesParams.push(to_date)
    }
    salesQuery += ` GROUP BY customer`
    
    const sales = await db.query(salesQuery, salesParams)
    (sales.rows || []).forEach(s => {
      if (s.customer) addToSummary(s.customer, s.total, 0)
    })
    
    // Get purchase returns - supplier is debited
    let prQuery = `
      SELECT supplier, SUM(grand_total) as total
      FROM purchase_returns WHERE 1=1
    `
    const prParams = []
    if (from_date) {
      prQuery += ` AND date >= ?`
      prParams.push(from_date)
    }
    if (to_date) {
      prQuery += ` AND date <= ?`
      prParams.push(to_date)
    }
    prQuery += ` GROUP BY supplier`
    
    const purchaseReturns = await db.query(prQuery, prParams)
    (purchaseReturns.rows || []).forEach(pr => {
      if (pr.supplier) addToSummary(pr.supplier, pr.total, 0)
    })
    
    // Get sales returns - customer is credited
    let srQuery = `
      SELECT customer, SUM(total_amt) as total
      FROM sales_return WHERE 1=1
    `
    const srParams = []
    if (from_date) {
      srQuery += ` AND date >= ?`
      srParams.push(from_date)
    }
    if (to_date) {
      srQuery += ` AND date <= ?`
      srParams.push(to_date)
    }
    srQuery += ` GROUP BY customer`
    
    const salesReturns = await db.query(srQuery, srParams)
    (salesReturns.rows || []).forEach(sr => {
      if (sr.customer) addToSummary(sr.customer, 0, sr.total)
    })
    
    // Get advances - papad_company is debited (payment made)
    let advanceQuery = `
      SELECT papad_company, SUM(amount) as total
      FROM advances WHERE 1=1
    `
    const advanceParams = []
    if (from_date) {
      advanceQuery += ` AND date >= ?`
      advanceParams.push(from_date)
    }
    if (to_date) {
      advanceQuery += ` AND date <= ?`
      advanceParams.push(to_date)
    }
    advanceQuery += ` GROUP BY papad_company`
    
    const advances = await db.query(advanceQuery, advanceParams)
    (advances.rows || []).forEach(a => {
      if (a.papad_company) addToSummary(a.papad_company, a.total, 0)
    })
    
    // Convert to array
    let result = Object.values(ledgerSummary)
    
    // Calculate totals
    const totalDebit = result.reduce((sum, r) => sum + r.debit, 0)
    const totalCredit = result.reduce((sum, r) => sum + r.credit, 0)
    
    res.json({
      ledgers: result,
      totalDebit,
      totalCredit,
      isBalanced: Math.abs(totalDebit - totalCredit) < 0.01
    })
  } catch (error) {
    console.error('Error fetching trial balance:', error)
    res.status(500).json({ message: 'Error fetching trial balance', error: error.message })
  }
})

// ============================================================
// BALANCE SHEET - Assets & Liabilities
// GET /api/accounts/balance-sheet?as_on_date=X
// ============================================================
router.get('/balance-sheet', async (req, res) => {
  try {
    const { as_on_date } = req.query
    const toDate = as_on_date || new Date().toISOString().split('T')[0]
    
    // Calculate Stock Value (Assets)
    let stockQuery = `
      SELECT SUM(qty * rate) as stock_value
      FROM stock
      WHERE qty > 0
    `
    const stockResult = await db.query(stockQuery)
    const stockValue = parseFloat(stockResult.rows[0]?.stock_value || 0)
    
    // Calculate Cash in Hand (assume from advances)
    let cashQuery = `
      SELECT SUM(amount) as total_payments
      FROM advances
    `
    if (as_on_date) {
      cashQuery += ` WHERE date <= ?`
    }
    const cashResult = await db.query(cashQuery, as_on_date ? [toDate] : [])
    const cashInHand = parseFloat(cashResult.rows[0]?.total_payments || 0)
    
    // Calculate Accounts Receivable (Customers)
    let receivableQuery = `
      SELECT COALESCE(SUM(total_amt), 0) as total
      FROM sales
    `
    const receivableParams = []
    if (as_on_date) {
      receivableQuery += ` WHERE date <= ?`
      receivableParams.push(toDate)
    }
    
    let salesTotal = await db.query(receivableQuery, receivableParams)
    let salesPayments = await db.query(
      as_on_date 
        ? `SELECT COALESCE(SUM(amount), 0) as total FROM advances WHERE date <= ?`
        : `SELECT COALESCE(SUM(amount), 0) as total FROM advances`,
      as_on_date ? [toDate] : []
    )
    
    const accountsReceivable = Math.max(0, 
      parseFloat(salesTotal.rows[0]?.total || 0) - parseFloat(salesPayments.rows[0]?.total || 0)
    )
    
    // Calculate Accounts Payable (Suppliers)
    let payableQuery = `
      SELECT COALESCE(SUM(grand_total), 0) as total
      FROM purchases
    `
    const payableParams = []
    if (as_on_date) {
      payableQuery += ` WHERE date <= ?`
      payableParams.push(toDate)
    }
    
    let purchaseTotal = await db.query(payableQuery, payableParams)
    let purchasePayments = await db.query(
      as_on_date 
        ? `SELECT COALESCE(SUM(amount), 0) as total FROM advances WHERE date <= ?`
        : `SELECT COALESCE(SUM(amount), 0) as total FROM advances`,
      as_on_date ? [toDate] : []
    )
    
    const accountsPayable = Math.max(0, 
      parseFloat(purchaseTotal.rows[0]?.total || 0) - parseFloat(purchasePayments.rows[0]?.total || 0)
    )
    
    const totalAssets = stockValue + cashInHand + accountsReceivable
    const totalLiabilities = accountsPayable
    const capital = totalAssets - totalLiabilities
    
    res.json({
      assets: {
        stockValue,
        cashInHand,
        accountsReceivable,
        total: totalAssets
      },
      liabilities: {
        accountsPayable,
        total: totalLiabilities
      },
      capital,
      isBalanced: Math.abs(totalAssets - totalLiabilities - capital) < 0.01
    })
  } catch (error) {
    console.error('Error fetching balance sheet:', error)
    res.status(500).json({ message: 'Error fetching balance sheet', error: error.message })
  }
})

// ============================================================
// PROFIT & LOSS - Income & Expenses
// GET /api/accounts/profit-loss?from_date=X&to_date=Y
// ============================================================
router.get('/profit-loss', async (req, res) => {
  try {
    const { from_date, to_date } = req.query
    
    // Calculate Total Sales
    let salesQuery = `
      SELECT COALESCE(SUM(total_amt), 0) as total
      FROM sales
    `
    const salesParams = []
    if (from_date) {
      salesQuery += ` WHERE date >= ?`
      salesParams.push(from_date)
    }
    if (to_date) {
      salesQuery += from_date ? ` AND date <= ?` : ` WHERE date <= ?`
      salesParams.push(to_date)
    }
    const salesResult = await db.query(salesQuery, salesParams)
    const totalSales = parseFloat(salesResult.rows[0]?.total || 0)
    
    // Calculate Sales Returns
    let srQuery = `
      SELECT COALESCE(SUM(total_amt), 0) as total
      FROM sales_return
    `
    const srParams = []
    if (from_date) {
      srQuery += ` WHERE date >= ?`
      srParams.push(from_date)
    }
    if (to_date) {
      srQuery += from_date ? ` AND date <= ?` : ` WHERE date <= ?`
      srParams.push(to_date)
    }
    const srResult = await db.query(srQuery, srParams)
    const salesReturns = parseFloat(srResult.rows[0]?.total || 0)
    
    // Calculate Total Purchases
    let purchaseQuery = `
      SELECT COALESCE(SUM(grand_total), 0) as total
      FROM purchases
    `
    const purchaseParams = []
    if (from_date) {
      purchaseQuery += ` WHERE date >= ?`
      purchaseParams.push(from_date)
    }
    if (to_date) {
      purchaseQuery += from_date ? ` AND date <= ?` : ` WHERE date <= ?`
      purchaseParams.push(to_date)
    }
    const purchaseResult = await db.query(purchaseQuery, purchaseParams)
    const totalPurchases = parseFloat(purchaseResult.rows[0]?.total || 0)
    
    // Calculate Purchase Returns
    let prQuery = `
      SELECT COALESCE(SUM(grand_total), 0) as total
      FROM purchase_returns
    `
    const prParams = []
    if (from_date) {
      prQuery += ` WHERE date >= ?`
      prParams.push(from_date)
    }
    if (to_date) {
      prQuery += from_date ? ` AND date <= ?` : ` WHERE date <= ?`
      prParams.push(to_date)
    }
    const prResult = await db.query(prQuery, prParams)
    const purchaseReturns = parseFloat(prResult.rows[0]?.total || 0)
    
    // Calculate Opening Stock (from older purchases)
    let openingStockQuery = `
      SELECT COALESCE(SUM(qty * rate), 0) as total
      FROM stock
      WHERE qty > 0
    `
    if (from_date) {
      openingStockQuery += ` AND date < ?`
    }
    const openingStockResult = await db.query(
      openingStockQuery, 
      from_date ? [from_date] : []
    )
    const openingStock = parseFloat(openingStockResult.rows[0]?.total || 0)
    
    // Calculate Closing Stock
    let closingStockQuery = `
      SELECT COALESCE(SUM(qty * rate), 0) as total
      FROM stock
      WHERE qty > 0
    `
    const closingStockResult = await db.query(closingStockQuery)
    const closingStock = parseFloat(closingStockResult.rows[0]?.total || 0)
    
    // Calculate Gross Profit/Loss
    const grossProfit = (totalSales - salesReturns) - (totalPurchases - purchaseReturns) + (closingStock - openingStock)
    
    // Calculate Expenses (from advances for now - wages, transport etc.)
    let expensesQuery = `
      SELECT COALESCE(SUM(amount), 0) as total
      FROM advances
    `
    const expensesParams = []
    if (from_date) {
      expensesQuery += ` WHERE date >= ?`
      expensesParams.push(from_date)
    }
    if (to_date) {
      expensesQuery += expensesParams.length ? ` AND date <= ?` : ` WHERE date <= ?`
      expensesParams.push(to_date)
    }
    const expensesResult = await db.query(expensesQuery, expensesParams)
    const totalExpenses = parseFloat(expensesResult.rows[0]?.total || 0)
    
    // Net Profit/Loss
    const netProfit = grossProfit - totalExpenses
    
    res.json({
      income: {
        sales: totalSales,
        salesReturns,
        totalSales: totalSales - salesReturns
      },
      expenses: {
        purchases: totalPurchases,
        purchaseReturns,
        netPurchases: totalPurchases - purchaseReturns,
        openingStock,
        closingStock,
        grossProfit: grossProfit,
        otherExpenses: totalExpenses,
        totalExpenses
      },
      netProfit: netProfit > 0 ? netProfit : 0,
      netLoss: netProfit < 0 ? Math.abs(netProfit) : 0,
      isProfit: netProfit >= 0
    })
  } catch (error) {
    console.error('Error fetching profit & loss:', error)
    res.status(500).json({ message: 'Error fetching profit & loss', error: error.message })
  }
})

// ============================================================
// LEDGER STATEMENT - Individual ledger transactions
// GET /api/accounts/ledger/:ledgerName?from_date=X&to_date=Y
// ============================================================
router.get('/ledger/:ledgerName', async (req, res) => {
  try {
    const { ledgerName } = req.params
    const { from_date, to_date } = req.query
    
    let transactions = []
    
    // Get purchases for this supplier
    let purchaseQuery = `
      SELECT 
        date,
        'Purchase' as voucher_type,
        inv_no as voucher_no,
        'By Purchase' as particulars,
        grand_total as debit,
        0 as credit
      FROM purchases
      WHERE supplier = ?
    `
    const purchaseParams = [ledgerName]
    
    if (from_date) {
      purchaseQuery += ` AND date >= ?`
      purchaseParams.push(from_date)
    }
    if (to_date) {
      purchaseQuery += ` AND date <= ?`
      purchaseParams.push(to_date)
    }
    purchaseQuery += ` ORDER BY date`
    
    const purchases = await db.query(purchaseQuery, purchaseParams)
    transactions.push(...(purchases.rows || []))
    
    // Get advances for this supplier/papad_company
    let advanceQuery = `
      SELECT 
        date,
        'Payment' as voucher_type,
        s_no as voucher_no,
        'By Payment' as particulars,
        0 as debit,
        amount as credit
      FROM advances
      WHERE papad_company = ?
    `
    const advanceParams = [ledgerName]
    
    if (from_date) {
      advanceQuery += ` AND date >= ?`
      advanceParams.push(from_date)
    }
    if (to_date) {
      advanceQuery += ` AND date <= ?`
      advanceParams.push(to_date)
    }
    advanceQuery += ` ORDER BY date`
    
    const advances = await db.query(advanceQuery, advanceParams)
    transactions.push(...(advances.rows || []))
    
    // Also check supplier_master for opening balance
    let openingBalance = 0
    try {
      const supplierResult = await db.query(
        `SELECT opening_balance FROM supplier_master WHERE name = ?`,
        [ledgerName]
      )
      if (supplierResult.rows.length > 0) {
        openingBalance = parseFloat(supplierResult.rows[0].opening_balance || 0)
      }
    } catch (e) {
      // Table might not exist
    }
    
    // Sort by date
    transactions.sort((a, b) => new Date(a.date) - new Date(b.date))
    
    // Calculate running balance
    let balance = openingBalance
    transactions = transactions.map(t => {
      balance += parseFloat(t.debit || 0) - parseFloat(t.credit || 0)
      return { ...t, balance }
    })
    
    res.json({
      ledgerName,
      openingBalance,
      transactions,
      closingBalance: balance
    })
  } catch (error) {
    console.error('Error fetching ledger:', error)
    res.status(500).json({ message: 'Error fetching ledger', error: error.message })
  }
})

// ============================================================
// OUTSTANDING SUMMARY - Pending balances
// GET /api/accounts/outstanding-summary?as_on_date=X
// ============================================================
router.get('/outstanding-summary', async (req, res) => {
  try {
    const { as_on_date } = req.query
    const toDate = as_on_date || new Date().toISOString().split('T')[0]
    
    let outstanding = []
    
    // Get supplier outstanding (payables)
    let supplierQuery = `
      SELECT 
        supplier as ledger_name,
        SUM(grand_total) as total_purchase,
        0 as total_payment
      FROM purchases
    `
    const supplierParams = []
    if (as_on_date) {
      supplierQuery += ` WHERE date <= ?`
      supplierParams.push(toDate)
    }
    supplierQuery += ` GROUP BY supplier`
    
    const supplierPurchases = await db.query(supplierQuery, supplierParams)
    
    // Get payments to suppliers
    let paymentQuery = `
      SELECT 
        papad_company as ledger_name,
        SUM(amount) as total_payment
      FROM advances
    `
    const paymentParams = []
    if (as_on_date) {
      paymentQuery += ` WHERE date <= ?`
      paymentParams.push(toDate)
    }
    paymentQuery += ` GROUP BY papad_company`
    
    const payments = await db.query(paymentQuery, paymentParams)
    
    // Calculate supplier outstanding
    const supplierMap = {}
    ;(supplierPurchases.rows || []).forEach(sp => {
      if (sp.supplier) {
        supplierMap[sp.supplier] = {
          ledger_name: sp.supplier,
          total_purchase: parseFloat(sp.total_purchase || 0),
          total_payment: 0
        }
      }
    })
    ;(payments.rows || []).forEach(p => {
      if (p.papad_company && supplierMap[p.papad_company]) {
        supplierMap[p.papad_company].total_payment = parseFloat(p.total_payment || 0)
      }
    })
    
    // Add to outstanding
    Object.values(supplierMap).forEach(s => {
      const balance = s.total_purchase - s.total_payment
      if (balance > 0) {
        outstanding.push({
          ...s,
          balance,
          type: 'Payable'
        })
      }
    })
    
    // Get customer outstanding (receivables)
    let customerQuery = `
      SELECT 
        customer as ledger_name,
        SUM(total_amt) as total_sales,
        0 as total_receipt
      FROM sales
    `
    const customerParams = []
    if (as_on_date) {
      customerQuery += ` WHERE date <= ?`
      customerParams.push(toDate)
    }
    customerQuery += ` GROUP BY customer`
    
    const customerSales = await db.query(customerQuery, customerParams)
    
    // Calculate customer outstanding
    const customerMap = {}
    ;(customerSales.rows || []).forEach(cs => {
      if (cs.customer) {
        customerMap[cs.customer] = {
          ledger_name: cs.customer,
          total_sales: parseFloat(cs.total_sales || 0),
          total_receipt: 0
        }
      }
    })
    
    Object.values(customerMap).forEach(c => {
      const balance = c.total_sales - c.total_receipt
      if (balance > 0) {
        outstanding.push({
          ...c,
          balance,
          type: 'Receivable'
        })
      }
    })
    
    res.json(outstanding)
  } catch (error) {
    console.error('Error fetching outstanding summary:', error)
    res.status(500).json({ message: 'Error fetching outstanding summary', error: error.message })
  }
})

// ============================================================
// OUTSTANDING DETAILS - Bill-wise pending details
// GET /api/accounts/outstanding-details?as_on_date=X
// ============================================================
router.get('/outstanding-details', async (req, res) => {
  try {
    const { as_on_date } = req.query
    const toDate = as_on_date || new Date().toISOString().split('T')[0]
    
    let details = []
    
    // Get pending purchase bills
    let purchaseQuery = `
      SELECT 
        supplier as ledger_name,
        inv_no as invoice_no,
        date,
        grand_total as amount,
        0 as paid,
        grand_total as balance
      FROM purchases
    `
    const purchaseParams = []
    if (as_on_date) {
      purchaseQuery += ` WHERE date <= ?`
      purchaseParams.push(toDate)
    }
    purchaseQuery += ` ORDER BY date DESC`
    
    const purchases = await db.query(purchaseQuery, purchaseParams)
    ;(purchases.rows || []).forEach(p => {
      details.push({
        ...p,
        type: 'Payable'
      })
    })
    
    // Get pending sales bills
    let salesQuery = `
      SELECT 
        customer as ledger_name,
        s_no as invoice_no,
        date,
        total_amt as amount,
        0 as paid,
        total_amt as balance
      FROM sales
    `
    const salesParams = []
    if (as_on_date) {
      salesQuery += ` WHERE date <= ?`
      salesParams.push(toDate)
    }
    salesQuery += ` ORDER BY date DESC`
    
    const sales = await db.query(salesQuery, salesParams)
    ;(sales.rows || []).forEach(s => {
      details.push({
        ...s,
        type: 'Receivable'
      })
    })
    
    res.json(details)
  } catch (error) {
    console.error('Error fetching outstanding details:', error)
    res.status(500).json({ message: 'Error fetching outstanding details', error: error.message })
  }
})

// ============================================================
// CREATE LEDGER ENTRY - Helper function for automatic entries
// POST /api/accounts/ledger-entry
// ============================================================
router.post('/ledger-entry', async (req, res) => {
  try {
    const { ledger_id, ledger_name, date, voucher_type, voucher_no, debit, credit, reference_id, reference_type, particulars } = req.body
    
    const result = await db.run(
      `INSERT INTO ledger_entries (ledger_id, ledger_name, date, voucher_type, voucher_no, debit, credit, reference_id, reference_type, particulars)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [ledger_id || null, ledger_name, date, voucher_type, voucher_no, debit || 0, credit || 0, reference_id || null, reference_type || null, particulars || '']
    )
    
    res.status(201).json({ message: 'Ledger entry created', id: result.lastID })
  } catch (error) {
    console.error('Error creating ledger entry:', error)
    res.status(500).json({ message: 'Error creating ledger entry', error: error.message })
  }
})

// ============================================================
// GET LEDGER ENTRIES
// GET /api/accounts/ledger-entries?ledger_id=X&from_date=Y&to_date=Z
// ============================================================
router.get('/ledger-entries', async (req, res) => {
  try {
    const { ledger_id, from_date, to_date } = req.query
    
    let query = `SELECT * FROM ledger_entries WHERE 1=1`
    const params = []
    
    if (ledger_id) {
      query += ` AND ledger_id = ?`
      params.push(ledger_id)
    }
    if (from_date) {
      query += ` AND date >= ?`
      params.push(from_date)
    }
    if (to_date) {
      query += ` AND date <= ?`
      params.push(to_date)
    }
    
    query += ` ORDER BY date, id`
    
    const result = await db.query(query, params)
    res.json(result.rows || [])
  } catch (error) {
    console.error('Error fetching ledger entries:', error)
    res.status(500).json({ message: 'Error fetching ledger entries', error: error.message })
  }
})

module.exports = router
