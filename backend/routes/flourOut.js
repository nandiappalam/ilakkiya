const express = require('express')
const router = express.Router()
const db = require('../config/database')

// GET all flour out records
router.get('/', async (req, res) => {
  try {
    // Get all flour_out records with their items joined
    const result = await db.query(`
      SELECT 
        fo.id,
        fo.s_no as sNo,
        fo.date,
        fo.papad_company as papadCompany,
        fo.remarks,
        fo.total_qty as totalQty,
        fo.total_weight as totalWeight,
        fo.total_wages as totalWages,
        fo.created_at as createdAt,
        fo.updated_at as updatedAt,
        foi.id as itemId,
        foi.item_name as itemName,
        foi.lot_no as lotNo,
        foi.weight,
        foi.qty,
        foi.total_wt as totalWt,
        foi.papad_kg as papadKg,
        foi.wages_bag as wagesBag,
        foi.wages
      FROM flour_out fo
      LEFT JOIN flour_out_items foi ON fo.id = foi.flour_out_id
      ORDER BY fo.created_at DESC, foi.id ASC
    `)
    
    // Transform the flat rows into the format expected by frontend
    // Group items by flour_out id
    const flourOutMap = new Map()
    
    for (const row of result.rows) {
      if (!flourOutMap.has(row.id)) {
        flourOutMap.set(row.id, {
          id: row.id,
          sNo: row.sNo,
          date: row.date,
          papadCompany: row.papadCompany,
          remarks: row.remarks,
          totalQty: row.totalQty,
          totalWeight: row.totalWeight,
          totalWages: row.totalWages,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          items: []
        })
      }
      
      // Add item if it exists
      if (row.itemId) {
        flourOutMap.get(row.id).items.push({
          itemId: row.itemId,
          itemName: row.itemName,
          lotNo: row.lotNo,
          weight: row.weight,
          qty: row.qty,
          totalWt: row.totalWt,
          papadKg: row.papadKg,
          wagesBag: row.wagesBag,
          wages: row.wages
        })
      }
    }
    
    // Convert map to array
    const flourOutArray = Array.from(flourOutMap.values())
    
    // Flatten for display: each item becomes a separate row
    const flatData = []
    for (const flourOut of flourOutArray) {
      if (flourOut.items.length === 0) {
        // No items, add a row with just the header info
        flatData.push({
          ...flourOut,
          itemId: null,
          itemName: '',
          lotNo: '',
          weight: 0,
          qty: 0,
          totalWt: 0,
          papadKg: 0,
          wagesBag: 0,
          wages: 0
        })
      } else {
        // Add a row for each item
        for (const item of flourOut.items) {
          flatData.push({
            ...flourOut,
            itemId: item.itemId,
            itemName: item.itemName,
            lotNo: item.lotNo,
            weight: item.weight,
            qty: item.qty,
            totalWt: item.totalWt,
            papadKg: item.papadKg,
            wagesBag: item.wagesBag,
            wages: item.wages
          })
        }
      }
    }
    
    res.json(flatData)
  } catch (error) {
    console.error('Error fetching flour out:', error)
    res.status(500).json({ message: 'Error fetching flour out records', error: error.message })
  }
})

// GET flour out by ID
router.get('/:id', async (req, res) => {
  try {
    const flourOutResult = await db.query('SELECT * FROM flour_out WHERE id = ?', [req.params.id])
    if (flourOutResult.rows.length === 0) {
      return res.status(404).json({ message: 'Flour out record not found' })
    }

    const itemsResult = await db.query('SELECT * FROM flour_out_items WHERE flour_out_id = ?', [req.params.id])

    const flourOut = {
      ...flourOutResult.rows[0],
      items: itemsResult.rows
    }

    res.json(flourOut)
  } catch (error) {
    console.error('Error fetching flour out:', error)
    res.status(500).json({ message: 'Error fetching flour out record' })
  }
})

// POST create new flour out
router.post('/', async (req, res) => {
  try {
    const { formData, items } = req.body

    // Validation
    if (!formData.date || !formData.papad_company || !items || items.length === 0) {
      return res.status(400).json({ message: 'Date, papad company, and at least one item are required' })
    }

    if (items.some(item => !item.item_name || item.qty <= 0)) {
      return res.status(400).json({ message: 'All items must have a name and positive quantity' })
    }

    // Calculate totals
    const totalQty = items.reduce((sum, item) => sum + (parseFloat(item.qty) || 0), 0)
    const totalWeight = items.reduce((sum, item) => sum + (parseFloat(item.total_wt) || 0), 0)
    const totalWages = items.reduce((sum, item) => sum + (parseFloat(item.wages) || 0), 0)

    // Check if papad_company exists in papad_company_master, if not, create it
    const existingCompany = await db.query('SELECT id FROM papad_company_master WHERE name = ?', [formData.papad_company])
    if (existingCompany.rows.length === 0) {
      await db.run('INSERT INTO papad_company_master (name, status) VALUES (?, ?)', [formData.papad_company, 'Active'])
    }

    // Insert flour out first
    const flourOutResult = await db.run(`
      INSERT INTO flour_out (s_no, date, papad_company, remarks, total_qty, total_weight, total_wages)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [formData.sNo, formData.date, formData.papad_company, formData.remarks, totalQty, totalWeight, totalWages])

    const flourOutId = flourOutResult.lastID

    try {
      // Insert flour out items
      for (const item of items) {
        // Check if item exists in item_master, if not, create it
        const existingItem = await db.query('SELECT id FROM item_master WHERE item_name = ?', [item.item_name])
        if (existingItem.rows.length === 0) {
          await db.run('INSERT INTO item_master (item_name, status) VALUES (?, ?)', [item.item_name, 'Active'])
        }

        await db.run(`
          INSERT INTO flour_out_items (flour_out_id, item_name, lot_no, weight, qty, total_wt, papad_kg, wages_bag, wages)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [flourOutId, item.item_name, item.lot_no || '', item.weight || 0, item.qty, item.total_wt || 0,
             item.papad_kg || 0, item.wages_bag || 0, item.wages || 0])
      }

      res.status(201).json({
        message: 'Flour out record saved successfully!',
        id: flourOutId
      })
    } catch (error) {
      // If items insert fails, delete the flour_out to clean up
      await db.run('DELETE FROM flour_out WHERE id = ?', [flourOutId])
      throw error
    }
  } catch (error) {
    console.error('Error saving flour out:', error)
    res.status(500).json({ message: 'Error saving flour out', error: error.message })
  }
})

// PUT update flour out
router.put('/:id', async (req, res) => {
  try {
    const { formData, items } = req.body
    const flourOutId = req.params.id

    // Calculate totals
    const totalQty = items.reduce((sum, item) => sum + (parseFloat(item.qty) || 0), 0)
    const totalWeight = items.reduce((sum, item) => sum + (parseFloat(item.total_wt) || 0), 0)
    const totalWages = items.reduce((sum, item) => sum + (parseFloat(item.wages) || 0), 0)

    // Update flour out
    await db.run(`
      UPDATE flour_out SET s_no = ?, date = ?, papad_company = ?, remarks = ?, total_qty = ?, total_weight = ?, total_wages = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [formData.sNo, formData.date, formData.papad_company, formData.remarks, totalQty, totalWeight, totalWages, flourOutId])

    // Delete existing items
    await db.run('DELETE FROM flour_out_items WHERE flour_out_id = ?', [flourOutId])

    // Insert updated items
    for (const item of items) {
      await db.run(`
        INSERT INTO flour_out_items (flour_out_id, item_name, lot_no, weight, qty, total_wt, papad_kg, wages_bag, wages)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [flourOutId, item.item_name, item.lot_no || '', item.weight || 0, item.qty, item.total_wt || 0,
           item.papad_kg || 0, item.wages_bag || 0, item.wages || 0])
    }

    res.json({ message: 'Flour out record updated successfully!' })
  } catch (error) {
    console.error('Error updating flour out:', error)
    res.status(500).json({ message: 'Error updating flour out' })
  }
})

// DELETE flour out
router.delete('/:id', async (req, res) => {
  try {
    await db.run('DELETE FROM flour_out WHERE id = ?', [req.params.id])
    res.json({ message: 'Flour out record deleted successfully' })
  } catch (error) {
    console.error('Error deleting flour out:', error)
    res.status(500).json({ message: 'Error deleting flour out' })
  }
})

module.exports = router
