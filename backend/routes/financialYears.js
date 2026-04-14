const express = require('express')
const router = express.Router()
const db = require('../config/database')

// ============================================================================
// FINANCIAL YEARS TABLE MANAGEMENT
// ============================================================================

// Create financial_years table if not exists
const createFinancialYearsTable = async () => {
  try {
    await db.run(`
      CREATE TABLE IF NOT EXISTS financial_years (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_id INTEGER NOT NULL,
        year_name TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        is_active INTEGER DEFAULT 0,
        is_locked INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
        UNIQUE(company_id, year_name)
      )
    `)
    console.log('financial_years table ready')
  } catch (error) {
    console.error('Error creating financial_years table:', error.message)
  }
}

createFinancialYearsTable()

// ============================================================================
// API ROUTES
// ============================================================================

// GET all financial years by company
router.get('/:companyId', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM financial_years WHERE company_id = ? ORDER BY year_name DESC',
      [req.params.companyId]
    )
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching financial years:', error)
    res.status(500).json({ message: 'Error fetching financial years', error: error.message })
  }
})

// GET active financial year for company
router.get('/:companyId/active', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM financial_years WHERE company_id = ? AND is_active = 1 LIMIT 1',
      [req.params.companyId]
    )
    if (result.rows.length > 0) {
      res.json(result.rows[0])
    } else {
      res.json(null)
    }
  } catch (error) {
    console.error('Error fetching active financial year:', error)
    res.status(500).json({ message: 'Error fetching active financial year', error: error.message })
  }
})

// POST create financial year
router.post('/', async (req, res) => {
  try {
    const { company_id, year_name, start_date, end_date } = req.body

    if (!company_id || !year_name || !start_date || !end_date) {
      return res.status(400).json({ message: 'Company, year name, start date and end date are required' })
    }

    // Check if year already exists
    const existing = await db.query(
      'SELECT id FROM financial_years WHERE company_id = ? AND year_name = ?',
      [company_id, year_name]
    )

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Financial year already exists for this company' })
    }

    const result = await db.run(
      'INSERT INTO financial_years (company_id, year_name, start_date, end_date, is_active) VALUES (?, ?, ?, ?, 0)',
      [company_id, year_name, start_date, end_date]
    )

    res.status(201).json({
      message: 'Financial year created successfully!',
      id: result.lastInsertRowid
    })
  } catch (error) {
    console.error('Error creating financial year:', error)
    res.status(500).json({ message: 'Error creating financial year', error: error.message })
  }
})

// PUT set active financial year
router.put('/:id/activate', async (req, res) => {
  try {
    const { company_id } = req.body

    // Deactivate all years for this company
    await db.run(
      'UPDATE financial_years SET is_active = 0 WHERE company_id = ?',
      [company_id]
    )

    // Activate the selected year
    await db.run(
      'UPDATE financial_years SET is_active = 1 WHERE id = ?',
      [req.params.id]
    )

    res.json({ message: 'Financial year activated successfully!' })
  } catch (error) {
    console.error('Error activating financial year:', error)
    res.status(500).json({ message: 'Error activating financial year', error: error.message })
  }
})

// PUT lock financial year
router.put('/:id/lock', async (req, res) => {
  try {
    await db.run(
      'UPDATE financial_years SET is_locked = 1 WHERE id = ?',
      [req.params.id]
    )

    res.json({ message: 'Financial year locked successfully!' })
  } catch (error) {
    console.error('Error locking financial year:', error)
    res.status(500).json({ message: 'Error locking financial year', error: error.message })
  }
})

// PUT unlock financial year
router.put('/:id/unlock', async (req, res) => {
  try {
    await db.run(
      'UPDATE financial_years SET is_locked = 0 WHERE id = ?',
      [req.params.id]
    )

    res.json({ message: 'Financial year unlocked successfully!' })
  } catch (error) {
    console.error('Error unlocking financial year:', error)
    res.status(500).json({ message: 'Error unlocking financial year', error: error.message })
  }
})

// PUT update financial year
router.put('/:id', async (req, res) => {
  try {
    const { year_name, start_date, end_date } = req.body

    await db.run(
      'UPDATE financial_years SET year_name = ?, start_date = ?, end_date = ? WHERE id = ?',
      [year_name, start_date, end_date, req.params.id]
    )

    res.json({ message: 'Financial year updated successfully!' })
  } catch (error) {
    console.error('Error updating financial year:', error)
    res.status(500).json({ message: 'Error updating financial year', error: error.message })
  }
})

// DELETE financial year
router.delete('/:id', async (req, res) => {
  try {
    // Check if year is active
    const year = await db.query(
      'SELECT is_active, is_locked FROM financial_years WHERE id = ?',
      [req.params.id]
    )

    if (year.rows.length === 0) {
      return res.status(404).json({ message: 'Financial year not found' })
    }

    if (year.rows[0].is_active) {
      return res.status(400).json({ message: 'Cannot delete active financial year' })
    }

    if (year.rows[0].is_locked) {
      return res.status(400).json({ message: 'Cannot delete locked financial year' })
    }

    await db.run('DELETE FROM financial_years WHERE id = ?', [req.params.id])

    res.json({ message: 'Financial year deleted successfully!' })
  } catch (error) {
    console.error('Error deleting financial year:', error)
    res.status(500).json({ message: 'Error deleting financial year', error: error.message })
  }
})

module.exports = router
