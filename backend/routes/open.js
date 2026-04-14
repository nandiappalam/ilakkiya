const express = require('express')
const router = express.Router()
const db = require('../config/database')

// GET all open entries
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM open ORDER BY id DESC')
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching open entries:', error)
    res.status(500).json({ message: 'Error fetching open entries', error: error.message })
  }
})

// GET single open entry by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM open WHERE id = ?', [req.params.id])

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Open entry not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error fetching open entry:', error)
    res.status(500).json({ message: 'Error fetching open entry', error: error.message })
  }
})

// POST create new open entry
router.post('/', async (req, res) => {
  try {
    const { s_no, date, description, amount, remarks } = req.body

    if (!s_no || !date) {
      return res.status(400).json({ message: 'S.No and Date are required' })
    }

    const result = await db.run(
      'INSERT INTO open (s_no, date, description, amount, remarks) VALUES (?, ?, ?, ?, ?)',
      [s_no, date, description || '', amount || 0, remarks || '']
    )

    res.status(201).json({
      message: 'Open entry created successfully',
      id: result.lastID
    })
  } catch (error) {
    console.error('Error creating open entry:', error)
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ message: 'Open entry with this S.No already exists' })
    } else {
      res.status(500).json({ message: 'Error creating open entry', error: error.message })
    }
  }
})

// PUT update open entry
router.put('/:id', async (req, res) => {
  try {
    const { s_no, date, description, amount, remarks } = req.body

    const result = await db.run(
      'UPDATE open SET s_no = ?, date = ?, description = ?, amount = ?, remarks = ? WHERE id = ?',
      [s_no, date, description || '', amount || 0, remarks || '', req.params.id]
    )

    if (result.changes > 0) {
      res.json({ message: 'Open entry updated successfully' })
    } else {
      res.status(404).json({ message: 'Open entry not found' })
    }
  } catch (error) {
    console.error('Error updating open entry:', error)
    res.status(500).json({ message: 'Error updating open entry', error: error.message })
  }
})

// DELETE open entry
router.delete('/:id', async (req, res) => {
  try {
    const result = await db.run('DELETE FROM open WHERE id = ?', [req.params.id])

    if (result.changes > 0) {
      res.json({ message: 'Open entry deleted successfully' })
    } else {
      res.status(404).json({ message: 'Open entry not found' })
    }
  } catch (error) {
    console.error('Error deleting open entry:', error)
    res.status(500).json({ message: 'Error deleting open entry', error: error.message })
  }
})

module.exports = router
