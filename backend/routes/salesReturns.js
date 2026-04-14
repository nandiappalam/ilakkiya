const express = require('express')
const router = express.Router()
const db = require('../config/database')

// Get all sales returns
router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT sr.*, sri.item_name, sri.lot_no, sri.qty, sri.rate, sri.disc_perc, sri.tax_perc, sri.total_amt
      FROM sales_return sr
      LEFT JOIN sales_return_items sri ON sr.id = sri.sales_return_id
      ORDER BY sr.date DESC
    `

    const result = await db.query(sql, [])
    
    // Group items by sales return
    const salesReturnsMap = new Map()
    
    result.rows.forEach(row => {
      const returnId = row.id
      if (!salesReturnsMap.has(returnId)) {
        salesReturnsMap.set(returnId, {
          id: row.id,
          s_no: row.s_no,
          date: row.date,
          customer: row.customer,
          remarks: row.remarks,
          total_qty: row.total_qty,
          total_wt: row.total_wt,
          total_amt: row.total_amt,
          pay_type: row.pay_type,
          tax_type: row.tax_type,
          address: row.address,
          items: []
        })
      }
      
      if (row.item_name) {
        salesReturnsMap.get(returnId).items.push({
          item_name: row.item_name,
          lot_no: row.lot_no,
          qty: row.qty,
          rate: row.rate,
          disc_perc: row.disc_perc,
          tax_perc: row.tax_perc,
          total_amt: row.total_amt
        })
      }
    })

    const salesReturns = Array.from(salesReturnsMap.values())
    res.json(salesReturns)
  } catch (err) {
    console.error('Error fetching sales returns:', err)
    res.status(500).json({ error: 'Failed to fetch sales returns' })
  }
})

// Get single sales return
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const sql = `
      SELECT sr.*, sri.*
      FROM sales_return sr
      LEFT JOIN sales_return_items sri ON sr.id = sri.sales_return_id
      WHERE sr.id = ?
    `

    const result = await db.query(sql, [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sales return not found' })
    }

    const salesReturn = {
      ...result.rows[0],
      items: result.rows.map(row => ({
        item_name: row.item_name,
        lot_no: row.lot_no,
        qty: row.qty,
        rate: row.rate,
        disc_perc: row.disc_perc,
        tax_perc: row.tax_perc,
        total_amt: row.total_amt
      }))
    }

    res.json(salesReturn)
  } catch (err) {
    console.error('Error fetching sales return:', err)
    res.status(500).json({ error: 'Failed to fetch sales return' })
  }
})

// Create new sales return
router.post('/', async (req, res) => {
  try {
    const { s_no, date, customer, pay_type, tax_type, address, remarks, total_qty, total_wt, total_amt, items } = req.body

    const sql = `
      INSERT INTO sales_return (s_no, date, customer, pay_type, tax_type, address, remarks, total_qty, total_wt, total_amt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    const result = await db.run(sql, [s_no, date, customer, pay_type, tax_type, address, remarks, total_qty, total_wt, total_amt])
    const salesReturnId = result.lastID || result.lastInsertRowid

    // Insert items if provided
    if (items && items.length > 0) {
      const itemSql = `
        INSERT INTO sales_return_items (sales_return_id, item_name, lot_no, qty, rate, disc_perc, tax_perc, total_amt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `

      for (const item of items) {
        await db.run(itemSql, [
          salesReturnId,
          item.item_name,
          item.lot_no,
          item.qty,
          item.rate,
          item.disc_perc,
          item.tax_perc,
          item.amount || item.total_amt
        ])
      }
    }

    res.status(201).json({ id: salesReturnId, message: 'Sales return created successfully' })
  } catch (err) {
    console.error('Error creating sales return:', err)
    res.status(500).json({ error: 'Failed to create sales return' })
  }
})

// Update sales return
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { s_no, date, customer, pay_type, tax_type, address, remarks, total_qty, total_wt, total_amt } = req.body

    const sql = `
      UPDATE sales_return
      SET s_no = ?, date = ?, customer = ?, pay_type = ?, tax_type = ?, address = ?, remarks = ?, total_qty = ?, total_wt = ?, total_amt = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `

    const result = await db.run(sql, [s_no, date, customer, pay_type, tax_type, address, remarks, total_qty, total_wt, total_amt, id])

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Sales return not found' })
    }

    res.json({ message: 'Sales return updated successfully' })
  } catch (err) {
    console.error('Error updating sales return:', err)
    res.status(500).json({ error: 'Failed to update sales return' })
  }
})

// Delete sales return
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    // Delete items first (due to foreign key constraint)
    await db.run('DELETE FROM sales_return_items WHERE sales_return_id = ?', [id])

    // Delete the sales return
    const result = await db.run('DELETE FROM sales_return WHERE id = ?', [id])

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Sales return not found' })
    }

    res.json({ message: 'Sales return deleted successfully' })
  } catch (err) {
    console.error('Error deleting sales return:', err)
    res.status(500).json({ error: 'Failed to delete sales return' })
  }
})

module.exports = router
