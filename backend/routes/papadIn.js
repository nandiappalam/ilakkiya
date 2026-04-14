const express = require('express')
const router = express.Router()
const db = require('../config/database')

// Papad In is essentially similar to flour out - it's flour sent to papad companies
// Using the same flour_out table but with a different type

// GET all papad in records
router.get('/', async (req, res) => {
  try {
    // Papad In records are stored in flour_out table with papad_company
    const result = await db.query(`
      SELECT fo.*, 
             json_group_array(
               json_object('id', foi.id, 'itemName', foi.item_name, 'lotNo', foi.lot_no,
                          'weight', foi.weight, 'qty', foi.qty, 'totalWt', foi.total_wt,
                          'papadKg', foi.papad_kg, 'wagesBag', foi.wages_bag, 'wages', foi.wages)
             ) as items
      FROM flour_out fo
      LEFT JOIN flour_out_items foi ON fo.id = foi.flour_out_id
      WHERE fo.papad_company IS NOT NULL AND fo.papad_company != ''
      GROUP BY fo.id
      ORDER BY fo.created_at DESC
    `)
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching papad in records:', error)
    res.status(500).json({ message: 'Error fetching papad in records', error: error.message })
  }
})

// GET papad in by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT fo.*, 
             json_group_array(
               json_object('id', foi.id, 'itemName', foi.item_name, 'lotNo', foi.lot_no,
                          'weight', foi.weight, 'qty', foi.qty, 'totalWt', foi.total_wt,
                          'papadKg', foi.papad_kg, 'wagesBag', foi.wages_bag, 'wages', foi.wages)
             ) as items
      FROM flour_out fo
      LEFT JOIN flour_out_items foi ON fo.id = foi.flour_out_id
      WHERE fo.id = ?
      GROUP BY fo.id
    `, [req.params.id])

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Papad In record not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error fetching papad in record:', error)
    res.status(500).json({ message: 'Error fetching papad in record', error: error.message })
  }
})

// POST create new papad in record
router.post('/', async (req, res) => {
  try {
    const { formData, items, totals } = req.body

    // Insert papad in (stored in flour_out table)
    const result = await db.run(`
      INSERT INTO flour_out (s_no, date, papad_company, remarks, total_qty, total_weight, total_wages)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      formData.sNo, 
      formData.date, 
      formData.papadCompany || formData.company, 
      formData.remarks, 
      totals.totalQty, 
      totals.totalWeight, 
      totals.totalWages
    ])

    const flourOutId = result.lastID

    // Insert items
    for (const item of items) {
      await db.run(`
        INSERT INTO flour_out_items (flour_out_id, item_name, lot_no, weight, qty, total_wt, papad_kg, wages_bag, wages)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        flourOutId, 
        item.itemName, 
        item.lotNo, 
        item.weight, 
        item.qty, 
        item.totalWt, 
        item.papadKg, 
        item.wagesBag, 
        item.wages
      ])
    }

    res.status(201).json({
      message: 'Papad In record saved successfully!',
      id: flourOutId
    })
  } catch (error) {
    console.error('Error saving papad in record:', error)
    res.status(500).json({ message: 'Error saving papad in record', error: error.message })
  }
})

// PUT update papad in record
router.put('/:id', async (req, res) => {
  try {
    const { formData, items, totals } = req.body
    const flourOutId = req.params.id

    // Update flour_out
    await db.run(`
      UPDATE flour_out SET s_no = ?, date = ?, papad_company = ?, remarks = ?, 
      total_qty = ?, total_weight = ?, total_wages = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      formData.sNo, 
      formData.date, 
      formData.papadCompany || formData.company, 
      formData.remarks, 
      totals.totalQty, 
      totals.totalWeight, 
      totals.totalWages, 
      flourOutId
    ])

    // Delete existing items
    await db.run('DELETE FROM flour_out_items WHERE flour_out_id = ?', [flourOutId])

    // Insert updated items
    for (const item of items) {
      await db.run(`
        INSERT INTO flour_out_items (flour_out_id, item_name, lot_no, weight, qty, total_wt, papad_kg, wages_bag, wages)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        flourOutId, 
        item.itemName, 
        item.lotNo, 
        item.weight, 
        item.qty, 
        item.totalWt, 
        item.papadKg, 
        item.wagesBag, 
        item.wages
      ])
    }

    res.json({ message: 'Papad In record updated successfully!' })
  } catch (error) {
    console.error('Error updating papad in record:', error)
    res.status(500).json({ message: 'Error updating papad in record', error: error.message })
  }
})

// DELETE papad in record
router.delete('/:id', async (req, res) => {
  try {
    await db.run('DELETE FROM flour_out WHERE id = ?', [req.params.id])
    res.json({ message: 'Papad In record deleted successfully' })
  } catch (error) {
    console.error('Error deleting papad in record:', error)
    res.status(500).json({ message: 'Error deleting papad in record', error: error.message })
  }
})

module.exports = router
