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
  // Early check - ensure body exists
  const body = req.body || {}
  console.log('POST vehicle-movements body:', JSON.stringify(body))
  console.log('Request headers:', req.headers['content-type'])
  
  const vehicle_no = body?.vehicle_no || body?.vehicleNo

  // Validation - at minimum vehicle_no required
  if (!vehicle_no) {
    return res.status(400).json({ 
      error: 'Vehicle No is required' 
    })
  }

  try {
    console.log('Inserting with vehicle_no:', vehicle_no)
    
    // Use explicit values with fallbacks
    const refType = body?.reference_type || body?.referenceType || null
    const refId = body?.reference_id || body?.referenceId || null
    const movType = body?.movement_type || body?.movementType || null
    const opType = body?.operation_type || body?.operationType || null
    const driver = body?.driver_name || body?.driverName || null
    const transporter = body?.transporter_id || body?.transporterId || null
    const gateIn = body?.gate_in_time || body?.gateInTime || null
    const gateOut = body?.gate_out_time || body?.gateOutTime || null
    const grossWt = parseFloat(body?.gross_weight || body?.grossWeight || 0) || 0
    const tareWt = parseFloat(body?.tare_weight || body?.tareWeight || 0) || 0
    const netWt = parseFloat(body?.net_weight || body?.netWeight || 0) || 0
    const stat = body?.status || 'IN'
    
    console.log('Parsed values:', { refType, refId, movType, opType, vehicle_no, driver, transporter, grossWt, tareWt, netWt, stat })
    
    const result = await db.run(`
      INSERT INTO vehicle_movements (
        reference_type, reference_id, movement_type, operation_type,
        vehicle_no, driver_name, transporter_id,
        gate_in_time, gate_out_time,
        gross_weight, tare_weight, net_weight, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      refType, refId, movType, opType,
      vehicle_no, driver, transporter,
      gateIn, gateOut,
      grossWt, tareWt, netWt,
      stat
    ])

    console.log('Insert result:', result)

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

