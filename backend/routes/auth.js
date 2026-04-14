const express = require('express')
const router = express.Router()
const db = require('../config/database')

// ============================================================================
// AUTH TABLES MANAGEMENT - Simplified initialization with logging
// ============================================================================

const createAuthTables = async () => {
  try {
    console.log('Creating auth tables...')
    await db.run(`PRAGMA foreign_keys = OFF`)
    
    // Create companies table
    await db.run(`CREATE TABLE IF NOT EXISTS companies (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, address TEXT, gst_number TEXT, contact TEXT, email TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)`)
    console.log('Companies table ready')
    
    // Create users table
    await db.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, role TEXT DEFAULT 'user', company_id INTEGER, status TEXT DEFAULT 'Active', created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)`)
    console.log('Users table ready')
    
    // Create user_permissions table
    await db.run(`DROP TABLE IF EXISTS user_permissions`)
    await db.run(`CREATE TABLE IF NOT EXISTS user_permissions (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, module_name TEXT NOT NULL, page_name TEXT NOT NULL, can_view INTEGER DEFAULT 0, can_create INTEGER DEFAULT 0, can_edit INTEGER DEFAULT 0, can_delete INTEGER DEFAULT 0, can_print INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, UNIQUE(user_id, module_name, page_name))`)
    console.log('User_permissions table ready')

    // Create login_history table
    await db.run(`DROP TABLE IF EXISTS login_history`)
    await db.run(`CREATE TABLE IF NOT EXISTS login_history (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, company_id INTEGER, login_time DATETIME DEFAULT CURRENT_TIMESTAMP, logout_time DATETIME, ip_address TEXT)`)
    console.log('Login_history table ready')
    
    await db.run(`PRAGMA foreign_keys = ON`)
    console.log('Auth tables initialized successfully')
  } catch (error) {
    console.error('Auth tables init error:', error.message)
  }
}

createAuthTables()

// ============================================================================
// SEED DEFAULT DATA
// ============================================================================
const seedDefaultData = async () => {
  try {
    const bcrypt = require('bcryptjs')
    const saltRounds = 10
    
    const adminPasswordHash = await bcrypt.hash('admin123', saltRounds)
    const staffPasswordHash = await bcrypt.hash('staff123', saltRounds)
    
    const companies = await db.query('SELECT COUNT(*) as count FROM companies')
    console.log('Companies count:', companies.rows[0].count)
    
    if (companies.rows[0].count === 0) {
      console.log('Seeding default company...')
      const companyResult = await db.run('INSERT INTO companies (name, address, gst_number, contact, email) VALUES (?, ?, ?, ?, ?)', ['BVC Company', '123 Main Street, City', '27AABCV1234A1Z5', '9876543210', 'info@bvc.com'])
      const companyId = companyResult.lastID
      console.log('Default company created with ID:', companyId)
      
      console.log('Seeding default users...')
      await db.run('INSERT INTO users (username, password_hash, role, status, company_id) VALUES (?, ?, ?, ?, ?)', ['admin', adminPasswordHash, 'Admin', 'Active', companyId])
      await db.run('INSERT INTO users (username, password_hash, role, status, company_id) VALUES (?, ?, ?, ?, ?)', ['staff', staffPasswordHash, 'Staff', 'Active', companyId])
      console.log('Default users created!')
    }
  } catch (error) {
    console.error('Error seeding default data:', error.message)
  }
}

setTimeout(seedDefaultData, 2000)

// ============================================================================
// API ROUTES
// ============================================================================

// GET login history
router.get('/login-history/:userId', async (req, res) => {
  try {
    const result = await db.query(`SELECT lh.*, u.username FROM login_history lh LEFT JOIN users u ON lh.user_id = u.id WHERE lh.user_id = ? ORDER BY lh.login_time DESC LIMIT 50`, [req.params.userId])
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching login history:', error)
    res.status(500).json({ message: 'Error fetching login history', error: error.message })
  }
})

// GET user permissions
router.get('/permissions/:userId', async (req, res) => {
  try {
    const result = await db.query(`SELECT module_name, page_name, can_view, can_create, can_edit, can_delete, can_print FROM user_permissions WHERE user_id = ?`, [req.params.userId])
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching permissions:', error)
    res.status(500).json({ message: 'Error fetching permissions', error: error.message })
  }
})

// POST login
router.post('/login', async (req, res) => {
  try {
    const { username, password, company_id } = req.body
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' })
    }

    let userResult;
    if (company_id) {
      userResult = await db.query('SELECT rowid as id, username, password_hash, role, status, company_id FROM users WHERE username = ? AND company_id = ?', [username, company_id])
    } else {
      userResult = await db.query('SELECT rowid as id, username, password_hash, role, status, company_id FROM users WHERE username = ?', [username])
    }

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password' })
    }

    const user = userResult.rows[0]
    console.log('Login user found:', user.username)

    const bcrypt = require('bcryptjs')
    let isValidPassword = false
    if (user.password_hash && user.password_hash.startsWith('$2')) {
      isValidPassword = await bcrypt.compare(password, user.password_hash)
    } else {
      isValidPassword = (password === user.password_hash)
    }

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid username or password' })
    }

    if (user.status === 'Inactive') {
      return res.status(401).json({ message: 'User account is inactive' })
    }

    const companyResult = await db.query('SELECT * FROM companies WHERE id = ?', [user.company_id])
    const company = companyResult.rows[0]

    if (!company) {
      return res.status(401).json({ message: 'User company not found' })
    }

    const permissionsResult = await db.query(`SELECT module_name, page_name, can_view, can_create, can_edit, can_delete, can_print FROM user_permissions WHERE user_id = ?`, [user.id])
    const permissions = permissionsResult.rows
    const isAdmin = user.role === 'admin' || user.role === 'Admin'

    const loginResult = await db.run('INSERT INTO login_history (user_id, company_id, ip_address) VALUES (?, ?, ?)', [user.id, user.company_id, req.ip])

    res.json({
      message: 'Login successful',
      user: { id: user.id, username: user.username, role: user.role, company_id: user.company_id, company_name: company.name },
      company: company,
      permissions: permissions,
      isAdmin: isAdmin,
      login_history_id: loginResult.lastInsertRowid
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Login failed', error: error.message })
  }
})

// POST logout
router.post('/logout', async (req, res) => {
  try {
    const { login_history_id } = req.body
    if (login_history_id) {
      await db.run('UPDATE login_history SET logout_time = CURRENT_TIMESTAMP WHERE id = ?', [login_history_id])
    }
    res.json({ message: 'Logout successful' })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ message: 'Logout failed', error: error.message })
  }
})

// POST create user - WITH DETAILED LOGGING
router.post('/users', async (req, res) => {
  console.log('=== POST /api/auth/users ===')
  console.log('Request body:', JSON.stringify(req.body))
  
  try {
    const { username, password, role, status, company_id, permissions } = req.body
    console.log('Parsed fields:', { username, password, role, status, company_id })

    if (!username || !password || !company_id) {
      console.log('Validation failed: missing required fields')
      return res.status(400).json({ message: 'Username, password and company are required' })
    }

    // Check if users table exists
    try {
      const tableCheck = await db.query("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
      console.log('Users table check:', tableCheck.rows)
    } catch (e) {
      console.log('Table check error:', e.message)
    }

    // Check for existing user - username has global UNIQUE constraint
    console.log('Checking for existing user...')
    const existingUser = await db.query('SELECT id, company_id FROM users WHERE username = ?', [username])
    console.log('Existing user result:', existingUser.rows)

    if (existingUser.rows.length > 0) {
      // If user exists, check if it's for the same company
      const existingForCompany = existingUser.rows.find(u => u.company_id === parseInt(company_id));
      if (existingForCompany) {
        return res.status(400).json({ message: 'Username already exists for this company' })
      }
      return res.status(400).json({ message: 'Username already exists in the system' })
    }

    // Insert new user - hash the password
    const bcrypt = require('bcryptjs')
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)
    
    const userResult = await db.run(
      'INSERT INTO users (username, password_hash, role, status, company_id) VALUES (?, ?, ?, ?, ?)',
      [username, passwordHash, role || 'user', status || 'Active', company_id]
    )
    console.log('User inserted, ID:', userResult.lastID)
    const userId = userResult.lastID

    // Add permissions if provided
    if (permissions && permissions.length > 0) {
      console.log('Adding permissions:', permissions.length)
      for (const perm of permissions) {
        if (perm.can_view || perm.can_create || perm.can_edit || perm.can_delete || perm.can_print) {
          await db.run(
            `INSERT INTO user_permissions (user_id, module_name, page_name, can_view, can_create, can_edit, can_delete, can_print) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, perm.module_name, perm.page_name || 'Display', perm.can_view ? 1 : 0, perm.can_create ? 1 : 0, perm.can_edit ? 1 : 0, perm.can_delete ? 1 : 0, perm.can_print ? 1 : 0]
          )
        }
      }
    }

    console.log('User created successfully!')
    res.status(201).json({ message: 'User created successfully!', id: userId })
  } catch (error) {
    console.error('=== ERROR creating user ===')
    console.error('Error:', error)
    console.error('Stack:', error.stack)
    
    // Handle UNIQUE constraint error specifically
    if (error.code === 'SQLITE_CONSTRAINT' || error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ message: 'Username already exists in the system. Please choose a different username.' })
    }
    
    res.status(500).json({ message: 'Error creating user', error: error.message })
  }
})

// GET users by company
router.get('/users/:companyId', async (req, res) => {
  try {
    // Join with companies table to get company name
    const result = await db.query(`
      SELECT u.rowid as id, u.username, u.role, u.status, u.created_at, u.company_id,
             c.name as company_name
      FROM users u
      LEFT JOIN companies c ON u.company_id = c.id
      WHERE u.company_id = ?
      ORDER BY u.username
    `, [req.params.companyId])
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({ message: 'Error fetching users', error: error.message })
  }
})

// GET all users (for admin view across all companies)
router.get('/users', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT u.rowid as id, u.username, u.role, u.status, u.created_at, u.company_id,
             c.name as company_name
      FROM users u
      LEFT JOIN companies c ON u.company_id = c.id
      ORDER BY u.username
    `)
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching all users:', error)
    res.status(500).json({ message: 'Error fetching users', error: error.message })
  }
})

// GET single user with permissions
router.get('/users/:companyId/:userId', async (req, res) => {
  try {
    const userResult = await db.query('SELECT id, username, role, status, company_id, created_at FROM users WHERE id = ? AND company_id = ?', [req.params.userId, req.params.companyId])
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }
    const permResult = await db.query(`SELECT module_name, page_name, can_view, can_create, can_edit, can_delete, can_print FROM user_permissions WHERE user_id = ?`, [req.params.userId])
    res.json({ ...userResult.rows[0], permissions: permResult.rows })
  } catch (error) {
    console.error('Error fetching user:', error)
    res.status(500).json({ message: 'Error fetching user', error: error.message })
  }
})

// PUT update user
router.put('/users/:userId', async (req, res) => {
  try {
    const { username, password, role, status, permissions } = req.body
    const { userId } = req.params

    if (password) {
      // Hash the password before updating
      const bcrypt = require('bcryptjs')
      const saltRounds = 10
      const passwordHash = await bcrypt.hash(password, saltRounds)
      await db.run('UPDATE users SET username = ?, password_hash = ?, role = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [username, passwordHash, role, status, userId])
    } else {
      await db.run('UPDATE users SET username = ?, role = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [username, role, status, userId])
    }

    if (permissions) {
      await db.run('DELETE FROM user_permissions WHERE user_id = ?', [userId])
      for (const perm of permissions) {
        if (perm.can_view || perm.can_create || perm.can_edit || perm.can_delete || perm.can_print) {
          await db.run(`INSERT INTO user_permissions (user_id, module_name, page_name, can_view, can_create, can_edit, can_delete, can_print) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [userId, perm.module_name, perm.page_name || 'Display', perm.can_view ? 1 : 0, perm.can_create ? 1 : 0, perm.can_edit ? 1 : 0, perm.can_delete ? 1 : 0, perm.can_print ? 1 : 0])
        }
      }
    }

    res.json({ message: 'User updated successfully!' })
  } catch (error) {
    console.error('Error updating user:', error)
    res.status(500).json({ message: 'Error updating user', error: error.message })
  }
})

// DELETE user
router.delete('/users/:userId', async (req, res) => {
  try {
    await db.run('DELETE FROM user_permissions WHERE user_id = ?', [req.params.userId])
    await db.run('DELETE FROM users WHERE id = ?', [req.params.userId])
    res.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    res.status(500).json({ message: 'Error deleting user', error: error.message })
  }
})

module.exports = router
