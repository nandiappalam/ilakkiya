const express = require('express')
const router = express.Router()
const db = require('../config/database')

// GET /api/vehicle-movements - List all with transporter join
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT vm.*, 
             tm.name as transporter_name
      FROM vehicle_movements vm 
      LEFT JOIN transport_master tm ON vm.transporter_id = tm.id 
      ORDER BY vm.created_at DESC
    `)
    res.json(result.rows)
  } catch (error) {
    console.error('GET vehicle-movements error:', error)
    res.status(500).json({ error: error.message })
  }
})

// GET /api/vehicle-movements/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT vm.*, 
             tm.name as transporter_name
      FROM vehicle_movements vm 
      LEFT JOIN transport_master tm ON vm.transporter_id = tm.id 
      WHERE vm.id = ?
    `, [req.params.id])
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Vehicle movement not found' })
    }
    
    res.json(result.rows[0])
  } catch (error) {
    console.error('GET vehicle-movements/:id error:', error)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/vehicle-movements - Create new
router.post('/', async (req, res) => {
  const {
    reference_type,
    reference_id,
    movement_type,
    operation_type,
    vehicle_no, 
    driver_name,
    transporter_id,
    gate_in_time,
    gate_out_time,
    gross_weight = 0,
    tare_weight = 0,
    net_weight = 0,
    status = 'IN'
  } = req.body

  // Validation
  if (!reference_type || !reference_id || !vehicle_no) {
    return res.status(400).json({ 
      error: 'reference_type, reference_id, and vehicle_no are required' 
    })
  }

  try {
    const result = await db.run(`
      INSERT INTO vehicle_movements (
        reference_type, reference_id, movement_type, operation_type,
        vehicle_no, driver_name, transporter_id,
        gate_in_time, gate_out_time,
        gross_weight, tare_weight, net_weight, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      reference_type, reference_id, movement_type, operation_type,
      vehicle_no, driver_name || null, transporter_id || null,
      gate_in_time || null, gate_out_time || null,
      parseFloat(gross_weight), parseFloat(tare_weight), parseFloat(net_weight),
      status
    ])

    res.status(201).json({ 
      success: true, 
      id: result.lastID,
      message: 'Vehicle movement created successfully'
    })
  } catch (error) {
    console.error('POST vehicle-movements error:', error)
    res.status(500).json({ error: error.message })
  }
})

// PUT /api/vehicle-movements/:id - Update (status, weights, times)
router.put('/:id', async (req, res) => {
  const updates = req.body
  const allowedFields = [
    'movement_type', 'operation_type', 'vehicle_no', 'driver_name', 
    'transporter_id', 'gate_in_time', 'gate_out_time', 
    'gross_weight', 'tare_weight', 'net_weight', 'status'
  ]
  
  const setClause = Object.keys(updates)
    .filter(key => allowedFields.includes(key))
    .map(key => `${key} = ?`)
    .join(', ')
  
  if (setClause === '') {
    return res.status(400).json({ error: 'No valid fields to update' })
  }

  try {
    const values = Object.values(updates).filter((_, i) => allowedFields.includes(Object.keys(updates)[i]))
    values.push(req.params.id)
    
    const result = await db.run(`
      UPDATE vehicle_movements 
      SET ${setClause} 
      WHERE id = ?
    `, values)

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Vehicle movement not found' })
    }

    res.json({ success: true, message: 'Vehicle movement updated' })
  } catch (error) {
    console.error('PUT vehicle-movements/:id error:', error)
    res.status(500).json({ error: error.message })
  }
})

// DELETE /api/vehicle-movements/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await db.run('DELETE FROM vehicle_movements WHERE id = ?', [req.params.id])
    
    if (result.changes === 0) {
      return res.status(404).json({ message: 'Vehicle movement not found' })
    }
    
    res.json({ success: true, message: 'Vehicle movement deleted' })
  } catch (error) {
    console.error('DELETE vehicle-movements/:id error:', error)
    res.status(500).json({ error: error.message })
  }
})

module.exports = router

