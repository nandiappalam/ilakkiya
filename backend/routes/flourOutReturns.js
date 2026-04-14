const express = require('express')
const router = express.Router()
const db = require('../config/database')

// GET all flour out returns
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT for.*,
             json_group_array(
               json_object('id', fori.id, 'itemName', fori.item_name, 'weight', fori.weight,
                          'qty', fori.qty, 'totalWt', fori.total_wt, 'papadKg', fori.papad_kg,
                          'cost', fori.cost, 'wagesBag', fori.wages_bag, 'wages', fori.wages)
             ) as items
      FROM flour_out_returns for
      LEFT JOIN flour_out_return_items fori ON for.id = fori.flour_out_return_id
      GROUP BY for.id
      ORDER BY for.created_at DESC
    `)
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching flour out returns:', error)
    res.status(500).json({ message: 'Error fetching flour out returns', error: error.message })
  }
})

// GET flour out return by ID
router.get('/:id', async (req, res) => {
  try {
    const flourOutReturnResult = await db.query('SELECT * FROM flour_out_returns WHERE id = ?', [req.params.id])
    if (flourOutReturnResult.rows.length === 0) {
      return res.status(404).json({ message: 'Flour out return not found' })
    }

    const itemsResult = await db.query('SELECT * FROM flour_out_return_items WHERE flour_out_return_id = ?', [req.params.id])

    const flourOutReturn = {
      ...flourOutReturnResult.rows[0],
      items: itemsResult.rows
    }

    res.json(flourOutReturn)
  } catch (error) {
    console.error('Error fetching flour out return:', error)
    res.status(500).json({ message: 'Error fetching flour out return' })
  }
})

// POST create new flour out return
router.post('/', async (req, res) => {
  try {
    const { formData, items, totals } = req.body

    // Insert flour out return
    const flourOutReturnResult = await db.run(`
      INSERT INTO flour_out_returns (s_no, date, tax_type, remarks, total_qty, total_weight, total_wages)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [formData.sNo, formData.date, formData.taxType, formData.remarks,
         totals.totalQty, totals.totalWeight, totals.totalWages])

    const flourOutReturnId = flourOutReturnResult.lastID

    // Insert flour out return items
    for (const item of items) {
      await db.run(`
        INSERT INTO flour_out_return_items (flour_out_return_id, item_name, weight, qty, total_wt, papad_kg, cost, wages_bag, wages)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [flourOutReturnId, item.itemName, item.weight, item.qty, item.totalWt,
           item.papadKg, item.cost, item.wagesBag, item.wages])
    }

    res.status(201).json({
      message: 'Flour out return saved successfully!',
      id: flourOutReturnId
    })
  } catch (error) {
    console.error('Error saving flour out return:', error)
    res.status(500).json({ message: 'Error saving flour out return', error: error.message })
  }
})

// PUT update flour out return
router.put('/:id', async (req, res) => {
  try {
    const { formData, items, totals } = req.body
    const flourOutReturnId = req.params.id

    // Update flour out return
    await db.run(`
      UPDATE flour_out_returns SET s_no = ?, date = ?, tax_type = ?, remarks = ?,
                                  total_qty = ?, total_weight = ?, total_wages = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [formData.sNo, formData.date, formData.taxType, formData.remarks,
         totals.totalQty, totals.totalWeight, totals.totalWages, flourOutReturnId])

    // Delete existing items
    await db.run('DELETE FROM flour_out_return_items WHERE flour_out_return_id = ?', [flourOutReturnId])

    // Insert updated items
    for (const item of items) {
      await db.run(`
        INSERT INTO flour_out_return_items (flour_out_return_id, item_name, weight, qty, total_wt, papad_kg, cost, wages_bag, wages)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [flourOutReturnId, item.itemName, item.weight, item.qty, item.totalWt,
           item.papadKg, item.cost, item.wagesBag, item.wages])
    }

    res.json({ message: 'Flour out return updated successfully!' })
  } catch (error) {
    console.error('Error updating flour out return:', error)
    res.status(500).json({ message: 'Error updating flour out return' })
  }
})

// DELETE flour out return
router.delete('/:id', async (req, res) => {
  try {
    await db.run('DELETE FROM flour_out_returns WHERE id = ?', [req.params.id])
    res.json({ message: 'Flour out return deleted successfully' })
  } catch (error) {
    console.error('Error deleting flour out return:', error)
    res.status(500).json({ message: 'Error deleting flour out return' })
  }
})

module.exports = router
