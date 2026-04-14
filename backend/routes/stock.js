const express = require('express')
const router = express.Router()
const db = require('../config/database')

// ============================================================================
// STOCK LOTS TABLE MANAGEMENT
// ============================================================================

// Create stock_lots table if not exists
const createStockLotsTable = async () => {
  try {
    await db.run(`
      CREATE TABLE IF NOT EXISTS stock_lots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_id INTEGER,
        item_name TEXT NOT NULL,
        lot_no TEXT NOT NULL,
        purchase_id INTEGER,
        quantity REAL DEFAULT 0,
        remaining_quantity REAL DEFAULT 0,
        rate REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('stock_lots table ready')
  } catch (error) {
    console.error('Error creating stock_lots table:', error.message)
  }
}

// Initialize table on module load
createStockLotsTable()

// ============================================================================
// CREATE INDEXES FOR PERFORMANCE
// ============================================================================
const createIndexes = async () => {
  try {
    await db.run(`CREATE INDEX IF NOT EXISTS idx_stock_lots_lot ON stock_lots(lot_no)`)
    await db.run(`CREATE INDEX IF NOT EXISTS idx_stock_lots_item ON stock_lots(item_name)`)
    await db.run(`CREATE INDEX IF NOT EXISTS idx_stock_lots_purchase ON stock_lots(purchase_id)`)
    await db.run(`CREATE INDEX IF NOT EXISTS idx_stock_lot_no ON stock(lot_no)`)
    await db.run(`CREATE INDEX IF NOT EXISTS idx_stock_item_name ON stock(item_name)`)
    console.log('Stock indexes created successfully')
  } catch (error) {
    console.error('Error creating stock indexes:', error.message)
  }
}
createIndexes()

// ============================================================================
// GET LOT HISTORY - Complete traceability of a lot
// Param: lot_no
// Returns: Purchase details, Grind conversions, Sales, Remaining stock
// ============================================================================
router.get('/lot-history/:lotNo', async (req, res) => {
  try {
    const { lotNo } = req.params
    
    // Get lot details from stock_lots
    const lotDetails = await db.query(`
      SELECT sl.*, p.supplier as supplier_name, p.date as purchase_date
      FROM stock_lots sl
      LEFT JOIN purchases p ON sl.purchase_id = p.id
      WHERE sl.lot_no = ?
    `, [lotNo])
    
    if (lotDetails.rows.length === 0) {
      return res.status(404).json({ message: 'Lot not found' })
    }
    
    const lot = lotDetails.rows[0]
    
    // Get purchase items for this lot
    const purchaseItems = await db.query(`
      SELECT pi.*, p.inv_no, p.date as purchase_date, p.supplier
      FROM purchase_items pi
      JOIN purchases p ON pi.purchase_id = p.id
      WHERE pi.lot_no = ? OR pi.lot_no LIKE ?
    `, [lotNo, `%${lotNo}%`])
    
    // Get sales items for this lot
    const salesItems = await db.query(`
      SELECT si.*, s.s_no, s.date as sales_date, s.customer
      FROM sales_items si
      JOIN sales s ON si.sales_id = s.id
      WHERE si.lot_no = ? OR si.lot_no LIKE ?
    `, [lotNo, `%${lotNo}%`])
    
    // Get flour out items (grind) for this lot
    const grindItems = await db.query(`
      SELECT foi.*, fo.s_no, fo.date as grind_date, fo.papad_company
      FROM flour_out_items foi
      JOIN flour_out fo ON foi.flour_out_id = fo.id
      WHERE foi.lot_no = ? OR foi.lot_no LIKE ?
    `, [lotNo, `%${lotNo}%`])
    
    // Get flour out output lots (flour lots created from this grain lot)
    const flourOutputLots = await db.query(`
      SELECT sl.*, fo.date as created_date
      FROM stock_lots sl
      JOIN flour_out fo ON sl.purchase_id = fo.id
      WHERE sl.item_name LIKE 'Flour%'
      AND fo.id IN (
        SELECT flour_out_id FROM flour_out_items 
        WHERE lot_no = ? OR lot_no LIKE ?
      )
    `, [lotNo, `%${lotNo}%`])
    
    res.json({
      lotDetails: lot,
      purchase: purchaseItems.rows,
      sales: salesItems.rows,
      grind: grindItems.rows,
      flourOutput: flourOutputLots.rows,
      summary: {
        initialQuantity: lot.quantity,
        remainingQuantity: lot.remaining_quantity,
        soldQuantity: (lot.quantity || 0) - (lot.remaining_quantity || 0),
        totalSales: salesItems.rows.length,
        totalGrind: grindItems.rows.length
      }
    })
  } catch (error) {
    console.error('Error fetching lot history:', error)
    res.status(500).json({ message: 'Error fetching lot history', error: error.message })
  }
})

// ============================================================================
// GET STOCK REPORT - Product Summary Mode
// Query Params: item_id (optional), from_date, to_date
// ============================================================================
router.get('/report', async (req, res) => {
  try {
    const { item_id, from_date, to_date } = req.query
    
    let query = `
      SELECT 
        item_name,
        SUM(CASE WHEN type = 'Purchase' THEN COALESCE(qty, 0) ELSE 0 END) as total_purchased,
        SUM(CASE WHEN type = 'Sale' THEN COALESCE(ABS(qty), 0) ELSE 0 END) as total_sold,
        SUM(CASE WHEN type = 'Purchase' THEN COALESCE(qty, 0) ELSE -COALESCE(ABS(qty), 0) END) as balance
      FROM stock
      WHERE 1=1
    `
    const params = []
    
    if (item_id) {
      query += ` AND item_name = (SELECT item_name FROM item_master WHERE id = ?)`
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
    
    query += ` GROUP BY item_name ORDER BY item_name ASC`
    
    const result = await db.query(query, params)
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching stock report:', error)
    res.status(500).json({ message: 'Error fetching stock report', error: error.message })
  }
})

// ============================================================================
// GET STOCK REPORT - Lot Breakdown Mode
// Query Params: item_id (optional)
// ============================================================================
router.get('/lots', async (req, res) => {
  try {
    const { item_id } = req.query
    
    let query = `
      SELECT 
        sl.id,
        sl.item_name,
        sl.lot_no,
        sl.quantity as purchased_qty,
        sl.remaining_quantity,
        sl.rate,
        sl.created_at,
        (sl.quantity - sl.remaining_quantity) as sold_qty
      FROM stock_lots sl
      WHERE 1=1
    `
    const params = []
    
    if (item_id) {
      query += ` AND sl.item_id = ?`
      params.push(item_id)
    }
    
    query += ` ORDER BY sl.item_name, sl.created_at ASC`
    
    const result = await db.query(query, params)
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching lot breakdown:', error)
    res.status(500).json({ message: 'Error fetching lot breakdown', error: error.message })
  }
})

// ============================================================================
// GET AVAILABLE LOTS FOR AN ITEM (for Sales Lot Selection)
// Returns lots with remaining_quantity > 0
// Query Param: item_id or item_name
// ============================================================================
router.get('/available-lots', async (req, res) => {
  try {
    const { item_id, item_name } = req.query
    
    let query = `
      SELECT 
        sl.id,
        sl.item_id,
        sl.item_name,
        sl.lot_no,
        sl.remaining_quantity,
        sl.rate,
        sl.created_at as purchase_date
      FROM stock_lots sl
      WHERE sl.remaining_quantity > 0
    `
    const params = []
    
    if (item_id) {
      query += ` AND sl.item_id = ?`
      params.push(item_id)
    }
    
    if (item_name) {
      query += ` AND sl.item_name = ?`
      params.push(item_name)
    }
    
    query += ` ORDER BY sl.created_at ASC`
    
    const result = await db.query(query, params)
    
    // Format response to show stock count
    const formatted = result.rows.map(row => ({
      lot_no: row.lot_no,
      remaining_quantity: row.remaining_quantity,
      purchase_date: row.purchase_date,
      display: `${row.lot_no} (${row.remaining_quantity} available)`
    }))
    
    res.json(formatted)
  } catch (error) {
    console.error('Error fetching available lots:', error)
    res.status(500).json({ message: 'Error fetching available lots', error: error.message })
  }
})

// ============================================================================
// GET AVAILABLE STOCK FOR AN ITEM (for FIFO deduction check)
// ============================================================================
router.get('/available/:itemName', async (req, res) => {
  try {
    const { itemName } = req.params
    
    const result = await db.query(`
      SELECT 
        sl.id,
        sl.item_name,
        sl.lot_no,
        sl.remaining_quantity,
        sl.rate,
        sl.created_at
      FROM stock_lots sl
      WHERE sl.item_name = ? AND sl.remaining_quantity > 0
      ORDER BY sl.created_at ASC
    `, [itemName])
    
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching available stock:', error)
    res.status(500).json({ message: 'Error fetching available stock', error: error.message })
  }
})

// ============================================================================
// GET ALL STOCK RECORDS
// ============================================================================
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM stock 
      ORDER BY created_at DESC
    `)
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching stock:', error)
    res.status(500).json({ message: 'Error fetching stock records', error: error.message })
  }
})

// ============================================================================
// GET STOCK BY ITEM NAME
// ============================================================================
router.get('/item/:itemName', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM stock 
      WHERE item_name = ?
      ORDER BY created_at DESC
    `, [req.params.itemName])
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching stock:', error)
    res.status(500).json({ message: 'Error fetching stock records' })
  }
})

// ============================================================================
// GET LOT-WISE STOCK SUMMARY
// ============================================================================
router.get('/lot-summary', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        item_name,
        lot_no,
        SUM(qty) as total_qty,
        SUM(weight) as total_weight,
        SUM(amount) as total_amount,
        MIN(date) as first_date,
        MAX(date) as last_date
      FROM stock
      GROUP BY item_name, lot_no
      ORDER BY item_name, lot_no
    `)
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching lot summary:', error)
    res.status(500).json({ message: 'Error fetching lot summary' })
  }
})

// ============================================================================
// POST - ADD STOCK (FOR PURCHASES)
// Auto-generates lot number and creates stock_lots entry
// ============================================================================
router.post('/', async (req, res) => {
  try {
    const { item_id, item_name, lot_no, qty, weight, rate, amount, date, type, reference_id } = req.body

    if (!item_name) {
      return res.status(400).json({ message: 'Item name is required' })
    }

    // Auto-generate lot number if not provided
    let finalLotNo = lot_no
    if (!finalLotNo) {
      // Generate lot number: ITEM-YYYYMMDD-SEQ
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      const seqResult = await db.query(`
        SELECT COUNT(*) as cnt FROM stock_lots 
        WHERE item_name = ? AND lot_no LIKE ?
      `, [item_name, `%${today}%`])
      const seq = (seqResult.rows[0]?.cnt || 0) + 1
      finalLotNo = `${item_name.substring(0, 3).toUpperCase()}-${today}-${String(seq).padStart(4, '0')}`
    }

    // Insert into stock table
    const result = await db.run(`
      INSERT INTO stock (item_name, lot_no, qty, weight, rate, amount, date, type, reference_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [item_name, finalLotNo, qty || 0, weight || 0, rate || 0, amount || 0, date, type || 'Purchase', reference_id])

    // Insert into stock_lots table
    await db.run(`
      INSERT INTO stock_lots (item_id, item_name, lot_no, purchase_id, quantity, remaining_quantity, rate)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [item_id, item_name, finalLotNo, reference_id, qty || 0, qty || 0, rate || 0])

    res.status(201).json({ 
      message: 'Stock added successfully!', 
      id: result.lastID,
      lot_no: finalLotNo
    })
  } catch (error) {
    console.error('Error adding stock:', error)
    res.status(500).json({ message: 'Error adding stock', error: error.message })
  }
})

// ============================================================================
// POST - DEDUCT STOCK (FOR SALES) - FIFO LOGIC
// ============================================================================
router.post('/deduct', async (req, res) => {
  try {
    const { item_name, qty, weight, amount, date, type, reference_id } = req.body

    if (!item_name || !qty) {
      return res.status(400).json({ message: 'Item name and quantity are required' })
    }

    // Get available lots ordered by FIFO (oldest first)
    const availableLots = await db.query(`
      SELECT * FROM stock_lots 
      WHERE item_name = ? AND remaining_quantity > 0
      ORDER BY created_at ASC
    `, [item_name])

    // Check if total available quantity is enough
    const totalAvailable = availableLots.reduce((sum, lot) => sum + lot.remaining_quantity, 0)
    if (totalAvailable < qty) {
      return res.status(400).json({ 
        message: `Insufficient stock for ${item_name}. Available: ${totalAvailable}, Requested: ${qty}` 
      })
    }

    // Deduct quantity lot by lot (FIFO)
    let remainingToDeduct = qty
    const deductions = []
    
    for (const lot of availableLots) {
      if (remainingToDeduct <= 0) break
      
      const deductFromThis = Math.min(lot.remaining_quantity, remainingToDeduct)
      
      // Update stock_lots remaining quantity
      await db.run(`
        UPDATE stock_lots 
        SET remaining_quantity = remaining_quantity - ?
        WHERE id = ?
      `, [deductFromThis, lot.id])

      // Add negative stock entry for tracking
      await db.run(`
        INSERT INTO stock (item_name, lot_no, qty, weight, rate, amount, date, type, reference_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [item_name, lot.lot_no, -deductFromThis, -(weight || 0) * (deductFromThis / qty), lot.rate, -(amount || 0), date, type || 'Sale', reference_id])

      deductions.push({
        lot_no: lot.lot_no,
        deducted: deductFromThis
      })
      
      remainingToDeduct -= deductFromThis
    }

    res.status(201).json({ 
      message: 'Stock deducted successfully (FIFO)!', 
      deductions
    })
  } catch (error) {
    console.error('Error deducting stock:', error)
    res.status(500).json({ message: 'Error deducting stock', error: error.message })
  }
})

// ============================================================================
// PUT - Update stock (legacy - for backwards compatibility)
// ============================================================================
router.put('/deduct', async (req, res) => {
  // Redirect to POST /deduct
  router.post('/deduct', async (req, res) => {
    try {
      const { item_name, lot_no, qty, weight, amount, date, type, reference_id } = req.body

      if (!item_name || !lot_no) {
        return res.status(400).json({ message: 'Item name and Lot No are required' })
      }

      // Check if there's enough stock
      const checkResult = await db.query(`
        SELECT SUM(remaining_quantity) as total_qty
        FROM stock_lots 
        WHERE item_name = ? AND lot_no = ?
      `, [item_name, lot_no])

      const availableQty = checkResult.rows[0]?.total_qty || 0
      if (availableQty < (qty || 0)) {
        return res.status(400).json({ message: `Insufficient stock for lot ${lot_no}. Available: ${availableQty}` })
      }

      // Update remaining quantity
      await db.run(`
        UPDATE stock_lots 
        SET remaining_quantity = remaining_quantity - ?
        WHERE item_name = ? AND lot_no = ?
      `, [qty || 0, item_name, lot_no])

      // Add negative stock entry (deduction)
      await db.run(`
        INSERT INTO stock (item_name, lot_no, qty, weight, rate, amount, date, type, reference_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [item_name, lot_no, -(qty || 0), -(weight || 0), 0, -(amount || 0), date, type || 'Sale', reference_id])

      res.status(201).json({ 
        message: 'Stock deducted successfully!', 
      })
    } catch (error) {
      console.error('Error deducting stock:', error)
      res.status(500).json({ message: 'Error deducting stock', error: error.message })
    }
  })
})

// ============================================================================
// DELETE - Remove stock record
// ============================================================================
router.delete('/:id', async (req, res) => {
  try {
    await db.run('DELETE FROM stock WHERE id = ?', [req.params.id])
    res.json({ message: 'Stock record deleted successfully' })
  } catch (error) {
    console.error('Error deleting stock:', error)
    res.status(500).json({ message: 'Error deleting stock record' })
  }
})

module.exports = router
