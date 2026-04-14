const express = require('express')
const router = express.Router()
const db = require('../config/database')

// GET all weight conversion records
router.get('/', async (req, res) => {
  try {
    // First get all weight conversions
    const result = await db.query(`
      SELECT * FROM weight_conversion ORDER BY id DESC
    `)
    
    // Then get items for each weight conversion
    const weightConversions = []
    for (const wc of result.rows) {
      const itemsResult = await db.query(
        'SELECT * FROM weight_conversion_items WHERE weight_conversion_id = ?',
        [wc.id]
      )
      weightConversions.push({
        ...wc,
        items: itemsResult.rows
      })
    }
    
    res.json(weightConversions)
  } catch (error) {
    console.error('Error fetching weight conversion:', error)
    res.status(500).json({ message: 'Error fetching weight conversion records', error: error.message })
  }
})

// GET weight conversion by ID
router.get('/:id', async (req, res) => {
  try {
    const weightConversionResult = await db.query('SELECT * FROM weight_conversion WHERE id = ?', [req.params.id])
    if (weightConversionResult.rows.length === 0) {
      return res.status(404).json({ message: 'Weight conversion record not found' })
    }

    const itemsResult = await db.query('SELECT * FROM weight_conversion_items WHERE weight_conversion_id = ?', [req.params.id])

    const weightConversion = {
      ...weightConversionResult.rows[0],
      items: itemsResult.rows
    }

    res.json(weightConversion)
  } catch (error) {
    console.error('Error fetching weight conversion:', error)
    res.status(500).json({ message: 'Error fetching weight conversion record' })
  }
})

// POST create new weight conversion
router.post('/', async (req, res) => {
  try {
    const { formData, items } = req.body

    // Validation
    if (!formData.date) {
      return res.status(400).json({ message: 'Date is required' })
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'At least one item is required' })
    }

    if (items.some(item => !item.item_name || item.qty <= 0)) {
      return res.status(400).json({ message: 'All items must have a name and positive quantity' })
    }

    // Insert weight conversion
    const weightConversionResult = await db.run(`
      INSERT INTO weight_conversion (s_no, date, remarks, type)
      VALUES (?, ?, ?, ?)
    `, [formData.sNo, formData.date, formData.remarks, formData.type])

    const weightConversionId = weightConversionResult.lastID

    // Insert weight conversion items
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      await db.run(`
        INSERT INTO weight_conversion_items (weight_conversion_id, s_no, item_name, lot_no, weight, qty, total_wt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [weightConversionId, i + 1, item.item_name, item.lot_no || '', item.weight || 0, item.qty, item.total_wt || 0])
    }

    res.status(201).json({
      message: 'Weight conversion record saved successfully!',
      id: weightConversionId
    })
  } catch (error) {
    console.error('Error saving weight conversion:', error)
    res.status(500).json({ message: 'Error saving weight conversion', error: error.message })
  }
})

// PUT update weight conversion
router.put('/:id', async (req, res) => {
  try {
    const { formData, items } = req.body
    const weightConversionId = req.params.id

    // Update weight conversion
    await db.run(`
      UPDATE weight_conversion SET s_no = ?, date = ?, remarks = ?, type = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [formData.sNo, formData.date, formData.remarks, formData.type, weightConversionId])

    // Delete existing items
    await db.run('DELETE FROM weight_conversion_items WHERE weight_conversion_id = ?', [weightConversionId])

    // Insert updated items
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      await db.run(`
        INSERT INTO weight_conversion_items (weight_conversion_id, s_no, item_name, lot_no, weight, qty, total_wt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [weightConversionId, i + 1, item.item_name, item.lot_no || '', item.weight || 0, item.qty, item.total_wt || 0])
    }

    res.json({ message: 'Weight conversion record updated successfully!' })
  } catch (error) {
    console.error('Error updating weight conversion:', error)
    res.status(500).json({ message: 'Error updating weight conversion' })
  }
})

// DELETE weight conversion
router.delete('/:id', async (req, res) => {
  try {
    await db.run('DELETE FROM weight_conversion WHERE id = ?', [req.params.id])
    res.json({ message: 'Weight conversion record deleted successfully' })
  } catch (error) {
    console.error('Error deleting weight conversion:', error)
    res.status(500).json({ message: 'Error deleting weight conversion' })
  }
})

module.exports = router
