const express = require('express')
const router = express.Router()
const db = require('../config/database')

// GET all grains records
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT g.*,
             json_group_array(
               json_object('id', gi.id, 'itemName', gi.item_name, 'lotNo', gi.lot_no,
                          'weight', gi.weight, 'qty', gi.qty, 'totalWt', gi.total_wt,
                          'wagesKg', gi.wages_kg, 'totalWages', gi.total_wages)
             ) as inputItems,
             json_group_array(
               json_object('id', go.id, 'itemName', go.item_name, 'weight', go.weight,
                          'qty', go.qty, 'totalWt', go.total_wt)
             ) as outputItems
      FROM grains g
      LEFT JOIN grain_input_items gi ON g.id = gi.grain_id
      LEFT JOIN grain_output_items go ON g.id = go.grain_id
      GROUP BY g.id
      ORDER BY g.created_at DESC
    `)
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching grains:', error)
    res.status(500).json({ message: 'Error fetching grains', error: error.message })
  }
})

// GET grains by ID
router.get('/:id', async (req, res) => {
  try {
    const grainResult = await db.query('SELECT * FROM grains WHERE id = ?', [req.params.id])
    if (grainResult.rows.length === 0) {
      return res.status(404).json({ message: 'Grains record not found' })
    }

    const inputItemsResult = await db.query('SELECT * FROM grain_input_items WHERE grain_id = ?', [req.params.id])
    const outputItemsResult = await db.query('SELECT * FROM grain_output_items WHERE grain_id = ?', [req.params.id])

    const grain = {
      ...grainResult.rows[0],
      inputItems: inputItemsResult.rows,
      outputItems: outputItemsResult.rows
    }

    res.json(grain)
  } catch (error) {
    console.error('Error fetching grain:', error)
    res.status(500).json({ message: 'Error fetching grain' })
  }
})

// POST create new grains record
router.post('/', async (req, res) => {
  try {
    const { formData, inputItems, outputItems } = req.body

    // Insert grain
    const grainResult = await db.run(`
      INSERT INTO grains (s_no, flour_mill, date, remarks)
      VALUES (?, ?, ?, ?)
    `, [formData.sNo, formData.flourMill, formData.date, formData.remarks])

    const grainId = grainResult.lastID

    // Insert input items
    for (const item of inputItems) {
      await db.run(`
        INSERT INTO grain_input_items (grain_id, item_name, lot_no, weight, qty, total_wt, wages_kg, total_wages)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [grainId, item.itemName, item.lotNo, item.weight, item.qty, item.totalWt, item.wagesKg, item.totalWages])
    }

    // Insert output items
    for (const item of outputItems) {
      await db.run(`
        INSERT INTO grain_output_items (grain_id, item_name, weight, qty, total_wt)
        VALUES (?, ?, ?, ?, ?)
      `, [grainId, item.itemName, item.weight, item.qty, item.totalWt])
    }

    res.status(201).json({
      message: 'Grains record saved successfully!',
      id: grainId
    })
  } catch (error) {
    console.error('Error saving grains:', error)
    res.status(500).json({ message: 'Error saving grains', error: error.message })
  }
})

// PUT update grains record
router.put('/:id', async (req, res) => {
  try {
    const { formData, inputItems, outputItems } = req.body
    const grainId = req.params.id

    // Update grain
    await db.run(`
      UPDATE grains SET s_no = ?, flour_mill = ?, date = ?, remarks = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [formData.sNo, formData.flourMill, formData.date, formData.remarks, grainId])

    // Delete existing items
    await db.run('DELETE FROM grain_input_items WHERE grain_id = ?', [grainId])
    await db.run('DELETE FROM grain_output_items WHERE grain_id = ?', [grainId])

    // Insert updated input items
    for (const item of inputItems) {
      await db.run(`
        INSERT INTO grain_input_items (grain_id, item_name, lot_no, weight, qty, total_wt, wages_kg, total_wages)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [grainId, item.itemName, item.lotNo, item.weight, item.qty, item.totalWt, item.wagesKg, item.totalWages])
    }

    // Insert updated output items
    for (const item of outputItems) {
      await db.run(`
        INSERT INTO grain_output_items (grain_id, item_name, weight, qty, total_wt)
        VALUES (?, ?, ?, ?, ?)
      `, [grainId, item.itemName, item.weight, item.qty, item.totalWt])
    }

    res.json({ message: 'Grains record updated successfully!' })
  } catch (error) {
    console.error('Error updating grains:', error)
    res.status(500).json({ message: 'Error updating grains' })
  }
})

// DELETE grains record
router.delete('/:id', async (req, res) => {
  try {
    await db.run('DELETE FROM grains WHERE id = ?', [req.params.id])
    res.json({ message: 'Grains record deleted successfully' })
  } catch (error) {
    console.error('Error deleting grains:', error)
    res.status(500).json({ message: 'Error deleting grains' })
  }
})

module.exports = router
