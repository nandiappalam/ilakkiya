const express = require('express')
const router = express.Router()
const db = require('../config/database')

// Execute Query (SELECT) - returns array of results
router.post('/query', async (req, res) => {
  try {
    const { sql, params } = req.body
    
    if (!sql) {
      return res.status(400).json({ message: 'SQL query is required' })
    }
    
    // Only allow SELECT queries for security
    if (!sql.trim().toUpperCase().startsWith('SELECT')) {
      return res.status(400).json({ message: 'Only SELECT queries are allowed' })
    }
    
    const result = await db.query(sql, params || [])
    res.json(result.rows)
  } catch (error) {
    console.error('Query error:', error)
    res.status(500).json({ message: 'Error executing query', error: error.message })
  }
})

// Execute Statement (INSERT, UPDATE, DELETE)
router.post('/statement', async (req, res) => {
  try {
    const { sql, params } = req.body
    
    if (!sql) {
      return res.status(400).json({ message: 'SQL statement is required' })
    }
    
    // Block dangerous operations
    const upperSql = sql.trim().toUpperCase()
    if (upperSql.startsWith('DROP') || upperSql.startsWith('ALTER') || upperSql.startsWith('CREATE')) {
      return res.status(400).json({ message: 'DDL operations are not allowed' })
    }
    
    const result = await db.run(sql, params || [])
    res.json({ 
      message: 'Statement executed successfully',
      lastID: result.lastID,
      changes: result.changes
    })
  } catch (error) {
    console.error('Statement error:', error)
    res.status(500).json({ message: 'Error executing statement', error: error.message })
  }
})

module.exports = router
