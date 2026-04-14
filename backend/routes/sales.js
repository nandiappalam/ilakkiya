const express = require('express')
const router = express.Router()
const db = require('../config/database')
const { createSalesLedgerEntries, deleteLedgerEntries } = require('../utils/ledgerHelper')

// GET all sales
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT s.*,
             json_group_array(
               json_object('id', si.id, 'itemName', si.item_name, 'lotNo', si.lot_no,
                          'weight', si.weight, 'qty', si.qty, 'totalWt', si.total_wt,
                          'rate', si.rate, 'discPerc', si.disc_perc, 'taxPerc', si.tax_perc, 'totalAmt', si.total_amt)
             ) as items
      FROM sales s
      LEFT JOIN sales_items si ON s.id = si.sales_id
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `)
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching sales:', error)
    res.status(500).json({ message: 'Error fetching sales', error: error.message })
  }
})

// GET sales by ID
router.get('/:id', async (req, res) => {
  try {
    const salesResult = await db.query('SELECT * FROM sales WHERE id = ?', [req.params.id])
    if (salesResult.rows.length === 0) {
      return res.status(404).json({ message: 'Sales record not found' })
    }

    const itemsResult = await db.query('SELECT * FROM sales_items WHERE sales_id = ?', [req.params.id])

    const sales = {
      ...salesResult.rows[0],
      items: itemsResult.rows
    }

    res.json(sales)
  } catch (error) {
    console.error('Error fetching sales:', error)
    res.status(500).json({ message: 'Error fetching sales' })
  }
})

// POST create new sales
router.post('/', async (req, res) => {
  try {
    const { formData, items, totals } = req.body

    // Validation
    if (!formData.date || !formData.customer || !items || items.length === 0) {
      return res.status(400).json({ message: 'Date, customer, and at least one item are required' })
    }

    if (items.some(item => !item.itemName || item.qty <= 0 || item.rate <= 0)) {
      return res.status(400).json({ message: 'All items must have a name, positive quantity, and positive rate' })
    }

    // Calculate totals
    const totalQty = items.reduce((sum, item) => sum + (parseFloat(item.qty) || 0), 0)
    const totalWt = items.reduce((sum, item) => sum + (parseFloat(item.totalWt) || 0), 0)
    const totalAmt = items.reduce((sum, item) => sum + (parseFloat(item.totalAmt) || 0), 0)

    // Insert sales
    const salesResult = await db.run(`
      INSERT INTO sales (s_no, date, customer, remarks, total_qty, total_wt, total_amt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [formData.sNo, formData.date, formData.customer, formData.remarks, totalQty, totalWt, totalAmt])

    const salesId = salesResult.lastID

    // Insert sales items and deduct from stock using FIFO
    for (const item of items) {
      // Insert sales item
      await db.run(`
        INSERT INTO sales_items (sales_id, item_name, lot_no, weight, qty, total_wt, rate, disc_perc, tax_perc, total_amt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [salesId, item.itemName, item.lotNo || '', item.weight || 0, item.qty, item.totalWt || 0,
           item.rate, item.discPerc || 0, item.taxPerc || 0, item.totalAmt || 0])
      
      // Deduct from stock using FIFO
      const qtyToDeduct = parseFloat(item.qty) || 0
      
      // Get available lots ordered by FIFO (oldest first)
      const availableLots = await db.query(`
        SELECT * FROM stock_lots 
        WHERE item_name = ? AND remaining_quantity > 0
        ORDER BY created_at ASC
      `, [item.itemName])
      
      // Check if total available quantity is enough
      const totalAvailable = availableLots.reduce((sum, lot) => sum + lot.remaining_quantity, 0)
      if (totalAvailable < qtyToDeduct) {
        // Rollback the sales insert
        await db.run('DELETE FROM sales_items WHERE sales_id = ?', [salesId])
        await db.run('DELETE FROM sales WHERE id = ?', [salesId])
        return res.status(400).json({ 
          message: `Insufficient stock for ${item.itemName}. Available: ${totalAvailable}, Requested: ${qtyToDeduct}` 
        })
      }
      
      // Deduct quantity lot by lot (FIFO)
      let remainingToDeduct = qtyToDeduct
      
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
          VALUES (?, ?, ?, ?, ?, ?, ?, 'Sale', ?)
        `, [item.itemName, lot.lot_no, -deductFromThis, -(item.weight || 0) * (deductFromThis / qtyToDeduct), item.rate, -item.totalAmt, formData.date, salesId])
        
        remainingToDeduct -= deductFromThis
      }
    }

    // Create sales ledger entries
    try {
      await createSalesLedgerEntries({
        customer: formData.customer,
        date: formData.date,
        invNo: formData.sNo,
        salesId: salesId,
        totalAmount: totalAmt,
        taxAmount: 0,
        discAmount: 0
      })
      console.log('Sales ledger entries created for sales ID:', salesId)
    } catch (ledgerError) {
      console.error('Error creating sales ledger entries:', ledgerError)
      // Continue even if ledger entries fail - don't rollback the sales
    }

    res.status(201).json({
      message: 'Sales record saved successfully! Stock deducted via FIFO.',
      id: salesId
    })
  } catch (error) {
    console.error('Error saving sales:', error)
    res.status(500).json({ message: 'Error saving sales', error: error.message })
  }
})

// PUT update sales
router.put('/:id', async (req, res) => {
  try {
    const { formData, items, totals } = req.body
    const salesId = req.params.id

    // Calculate totals
    const totalQty = items.reduce((sum, item) => sum + (parseFloat(item.qty) || 0), 0)
    const totalWt = items.reduce((sum, item) => sum + (parseFloat(item.totalWt) || 0), 0)
    const totalAmt = items.reduce((sum, item) => sum + (parseFloat(item.totalAmt) || 0), 0)

    // Update sales
    await db.run(`
      UPDATE sales SET s_no = ?, date = ?, customer = ?, remarks = ?, total_qty = ?, total_wt = ?, total_amt = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [formData.sNo, formData.date, formData.customer, formData.remarks, totalQty, totalWt, totalAmt, salesId])

    // Delete existing items
    await db.run('DELETE FROM sales_items WHERE sales_id = ?', [salesId])

    // Insert updated items
    for (const item of items) {
      await db.run(`
        INSERT INTO sales_items (sales_id, item_name, lot_no, weight, qty, total_wt, rate, disc_perc, tax_perc, total_amt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [salesId, item.itemName, item.lotNo || '', item.weight || 0, item.qty, item.totalWt || 0,
           item.rate, item.discPerc || 0, item.taxPerc || 0, item.totalAmt || 0])
    }

    // Update sales ledger entries
    try {
      await deleteLedgerEntries(salesId)
      await createSalesLedgerEntries({
        customer: formData.customer,
        date: formData.date,
        invNo: formData.sNo,
        salesId: salesId,
        totalAmount: totalAmt,
        taxAmount: 0,
        discAmount: 0
      })
      console.log('Sales ledger entries updated for sales ID:', salesId)
    } catch (ledgerError) {
      console.error('Error updating sales ledger entries:', ledgerError)
    }

    res.json({ message: 'Sales record updated successfully!' })
  } catch (error) {
    console.error('Error updating sales:', error)
    res.status(500).json({ message: 'Error updating sales' })
  }
})

// DELETE sales
router.delete('/:id', async (req, res) => {
  try {
    const salesId = req.params.id
    
    // Delete sales ledger entries first
    try {
      await deleteLedgerEntries(salesId)
    } catch (ledgerError) {
      console.error('Error deleting sales ledger entries:', ledgerError)
    }
    
    await db.run('DELETE FROM sales WHERE id = ?', [salesId])
    res.json({ message: 'Sales record deleted successfully' })
  } catch (error) {
    console.error('Error deleting sales:', error)
    res.status(500).json({ message: 'Error deleting sales' })
  }
})

module.exports = router
