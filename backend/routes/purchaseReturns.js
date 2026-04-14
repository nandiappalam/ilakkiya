const express = require('express')
const router = express.Router()
const db = require('../config/database')

// GET all purchase returns
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT pr.*, GROUP_CONCAT(pri.item_name || ',' || pri.weight || ',' || pri.qty || ',' || pri.total_wt || ',' || pri.rate || ',' || pri.disc_percent || ',' || pri.tax_percent || ',' || pri.amount) as items
      FROM purchase_returns pr
      LEFT JOIN purchase_return_items pri ON pr.id = pri.purchase_return_id
      GROUP BY pr.id
      ORDER BY pr.created_at DESC
    `)
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching purchase returns:', error)
    res.status(500).json({ message: 'Error fetching purchase returns' })
  }
})

// GET purchase return by ID
router.get('/:id', async (req, res) => {
  try {
    const purchaseReturnResult = await db.query('SELECT * FROM purchase_returns WHERE id = $1', [req.params.id])
    if (purchaseReturnResult.rows.length === 0) {
      return res.status(404).json({ message: 'Purchase return not found' })
    }

    const itemsResult = await db.query('SELECT * FROM purchase_return_items WHERE purchase_return_id = $1', [req.params.id])

    const purchaseReturn = {
      ...purchaseReturnResult.rows[0],
      items: itemsResult.rows
    }

    res.json(purchaseReturn)
  } catch (error) {
    console.error('Error fetching purchase return:', error)
    res.status(500).json({ message: 'Error fetching purchase return' })
  }
})

// POST create new purchase return
router.post('/', async (req, res) => {
  try {
    const { formData, items, totals } = req.body

    // Insert purchase return
    const purchaseReturnResult = await db.run(`
      INSERT INTO purchase_returns (
        s_no, date, return_inv_no, supplier, pay_type, inv_date, type, address,
        tax_type, godown, remarks, total_qty, total_weight, total_amount,
        base_amount, disc_amount, tax_amount, net_amount, auto_wages,
        vat_percent, vat, grand_total
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      formData.sNo, formData.date, formData.returnInvNo, formData.supplier, formData.payType,
      formData.invDate, formData.type, formData.address, formData.taxType, formData.godown,
      formData.remarks, totals.totalQty, totals.totalWeight, totals.totalAmount,
      totals.baseAmount, totals.discAmount, totals.taxAmount, totals.netAmount,
      totals.deductions.autoWages, totals.deductions.vatPercent, totals.deductions.vat, totals.grandTotal
    ])

    const purchaseReturnId = purchaseReturnResult.lastID

    // Insert purchase return items
    for (const item of items) {
      await db.run(`
        INSERT INTO purchase_return_items (
          purchase_return_id, lot_no, item_name, weight, qty, total_wt, rate, disc_percent, tax_percent, amount
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        purchaseReturnId, item.lotNo, item.itemName, item.weight, item.qty, item.totalWt,
        item.rate, item.disc, item.tax, item.amount
      ])
    }

    res.status(201).json({
      message: 'Purchase return saved successfully!',
      id: purchaseReturnId
    })
  } catch (error) {
    console.error('Error saving purchase return:', error)
    res.status(500).json({ message: 'Error saving purchase return', error: error.message })
  }
})

// PUT update purchase return
router.put('/:id', async (req, res) => {
  try {
    const { formData, items, totals } = req.body
    const purchaseReturnId = req.params.id

    // Update purchase return
    await db.query(`
      UPDATE purchase_returns SET
        s_no = ?, date = ?, return_inv_no = ?, supplier = ?, pay_type = ?,
        inv_date = ?, type = ?, address = ?, tax_type = ?, godown = ?,
        remarks = ?, total_qty = ?, total_weight = ?, total_amount = ?,
        base_amount = ?, disc_amount = ?, tax_amount = ?, net_amount = ?,
        auto_wages = ?, vat_percent = ?, vat = ?, grand_total = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      formData.sNo, formData.date, formData.returnInvNo, formData.supplier, formData.payType,
      formData.invDate, formData.type, formData.address, formData.taxType, formData.godown,
      formData.remarks, totals.totalQty, totals.totalWeight, totals.totalAmount,
      totals.baseAmount, totals.discAmount, totals.taxAmount, totals.netAmount,
      totals.deductions.autoWages, totals.deductions.vatPercent, totals.deductions.vat,
      totals.grandTotal, purchaseReturnId
    ])

    // Delete existing items
    await db.query('DELETE FROM purchase_return_items WHERE purchase_return_id = ?', [purchaseReturnId])

    // Insert updated items
    for (const item of items) {
      await db.query(`
        INSERT INTO purchase_return_items (
          purchase_return_id, lot_no, item_name, weight, qty, total_wt, rate, disc_percent, tax_percent, amount
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        purchaseReturnId, item.lotNo, item.itemName, item.weight, item.qty, item.totalWt,
        item.rate, item.disc, item.tax, item.amount
      ])
    }

    res.json({ message: 'Purchase return updated successfully!' })
  } catch (error) {
    console.error('Error updating purchase return:', error)
    res.status(500).json({ message: 'Error updating purchase return' })
  }
})

// DELETE purchase return
router.delete('/:id', async (req, res) => {
  try {
    const result = await db.run('DELETE FROM purchase_returns WHERE id = ?', [req.params.id])
    if (result.changes > 0) {
      res.json({ message: 'Purchase return deleted successfully' })
    } else {
      res.status(404).json({ message: 'Purchase return not found' })
    }
  } catch (error) {
    console.error('Error deleting purchase return:', error)
    res.status(500).json({ message: 'Error deleting purchase return', error: error.message })
  }
})

module.exports = router
