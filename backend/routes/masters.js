const express = require('express')
const router = express.Router()
const db = require('../config/database')

// Helper function to check if table exists
async function tableExists(tableName) {
  try {
    const result = await db.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name = ?",
      [tableName]
    )
    return result.rows.length > 0
  } catch (error) {
    console.error(`Error checking if table '${tableName}' exists:`, error.message)
    return false
  }
}

// Helper function to check if column exists in a table
async function columnExists(tableName, columnName) {
  try {
    const result = await db.query(`PRAGMA table_info(${tableName})`)
    return result.rows.some(col => col.name === columnName)
  } catch (error) {
    console.error(`Error checking column '${columnName}' in '${tableName}':`, error.message)
    return false
  }
}

// Master type aliases mapping
// hasStatus: true = table has status column and we filter by Active
// hasStatus: false = table doesn't have status column, return all records
// NOTE: Fixed hasStatus to correctly reflect which tables actually have status column
const masterTypeAliases = {
  // Type aliases (frontend-friendly names) -> { table, displayField, hasStatus }
  items: { table: 'item_master', displayField: 'item_name', hasStatus: true },
  item_group: { table: 'item_groups', displayField: 'group_name', hasStatus: false },
  item_groups: { table: 'item_groups', displayField: 'group_name', hasStatus: false },
  deduction_sale: { table: 'deduction_sales', displayField: 'ded_name', hasStatus: false },
  deduction_sales: { table: 'deduction_sales', displayField: 'ded_name', hasStatus: false },
  deduction_purchase: { table: 'deduction_purchase', displayField: 'ded_name', hasStatus: false },
  customer: { table: 'customer_master', displayField: 'name', hasStatus: true },
  customers: { table: 'customer_master', displayField: 'name', hasStatus: true },
  supplier: { table: 'supplier_master', displayField: 'name', hasStatus: true },
  suppliers: { table: 'supplier_master', displayField: 'name', hasStatus: true },
  flour_mill: { table: 'flour_mill_master', displayField: 'flourmill', hasStatus: true },
  flour_mills: { table: 'flour_mill_master', displayField: 'flourmill', hasStatus: true },
  papad_company: { table: 'papad_company_master', displayField: 'name', hasStatus: true },
  papad_companies: { table: 'papad_company_master', displayField: 'name', hasStatus: true },
  weight: { table: 'weightmaster', displayField: 'name', hasStatus: false },
  weights: { table: 'weightmaster', displayField: 'name', hasStatus: false },
  ledger_group: { table: 'ledgergroupmaster', displayField: 'name', hasStatus: false },
  ledger_groups: { table: 'ledgergroupmaster', displayField: 'name', hasStatus: false },
  ledger: { table: 'ledgermaster', displayField: 'name', hasStatus: false },
  ledgers: { table: 'ledgermaster', displayField: 'name', hasStatus: false },
  area: { table: 'area_master', displayField: 'name', hasStatus: true },
  areas: { table: 'area_master', displayField: 'name', hasStatus: true },
  city: { table: 'city_master', displayField: 'name', hasStatus: true },
  cities: { table: 'city_master', displayField: 'name', hasStatus: true },
  consignee: { table: 'consignee_group_master', displayField: 'name', hasStatus: true },
  consignees: { table: 'consignee_group_master', displayField: 'name', hasStatus: true },
  ptrans: { table: 'ptrans_master', displayField: 'name', hasStatus: true },
  sender: { table: 'sender_group_master', displayField: 'name', hasStatus: true },
  senders: { table: 'sender_group_master', displayField: 'name', hasStatus: true },
  transport: { table: 'transport_master', displayField: 'name', hasStatus: true },
  transports: { table: 'transport_master', displayField: 'name', hasStatus: true },
  godown: { table: 'godown_master', displayField: 'godown_name', hasStatus: false },
  godowns: { table: 'godown_master', displayField: 'godown_name', hasStatus: false },
  // Legacy table names also supported
  item_master: { table: 'item_master', displayField: 'item_name', hasStatus: true },
  customer_master: { table: 'customer_master', displayField: 'name', hasStatus: true },
  supplier_master: { table: 'supplier_master', displayField: 'name', hasStatus: true },
  flour_mill_master: { table: 'flour_mill_master', displayField: 'flourmill', hasStatus: true },
  flourmill_master: { table: 'flour_mill_master', displayField: 'flourmill', hasStatus: true },
  papad_company_master: { table: 'papad_company_master', displayField: 'name', hasStatus: true },
  papadcompany_master: { table: 'papad_company_master', displayField: 'name', hasStatus: true },
  weightmaster: { table: 'weightmaster', displayField: 'name', hasStatus: false },
  weight_master: { table: 'weightmaster', displayField: 'name', hasStatus: false },
  ledgergroupmaster: { table: 'ledgergroupmaster', displayField: 'name', hasStatus: false },
  ledger_group_master: { table: 'ledgergroupmaster', displayField: 'name', hasStatus: false },
  ledgermaster: { table: 'ledgermaster', displayField: 'name', hasStatus: false },
  ledger_master: { table: 'ledgermaster', displayField: 'name', hasStatus: false },
  area_master: { table: 'area_master', displayField: 'name', hasStatus: true },
  city_master: { table: 'city_master', displayField: 'name', hasStatus: true },
  transport_master: { table: 'transport_master', displayField: 'name', hasStatus: true },
  consignee_master: { table: 'consignee_group_master', displayField: 'name', hasStatus: true },
  consignee_group_master: { table: 'consignee_group_master', displayField: 'name', hasStatus: true },
  sender_master: { table: 'sender_group_master', displayField: 'name', hasStatus: true },
  sender_group_master: { table: 'sender_group_master', displayField: 'name', hasStatus: true },
  person_master: { table: 'person_master', displayField: 'name', hasStatus: true },
  ptrans_master: { table: 'ptrans_master', displayField: 'name', hasStatus: true },
}

// Master tables mapping with fields
// NOTE: Fixed to match actual schema from database/schema.sql
const masterTables = {
  item_master: {
    table: 'item_master',
    fields: ['item_code', 'item_name', 'print_name', 'item_group', 'type', 'tax', 'hsn_code', 'status'],
    uniqueField: 'item_code'
  },

  item_groups: {
    table: 'item_groups',
    fields: ['group_code', 'group_name', 'print_name', 'tax'],
    uniqueField: 'group_code'
  },
  deduction_sales: {
    table: 'deduction_sales',
    fields: ['ded_code', 'ded_name', 'print_name', 'adjust_with_sales', 'account_head', 'ded_type', 'calc_type', 'ded_value'],
    uniqueField: 'ded_code'
  },
  deduction_purchase: {
    table: 'deduction_purchase',
    fields: ['ded_code', 'ded_name', 'print_name', 'affect_cost_of_goods', 'type', 'debit_side_adjust', 'account_head', 'credit_adjust', 'deduction_type', 'calculation_type', 'deduction_value', 'status'],
    uniqueField: 'ded_code'
  },
  customer_master: {
    table: 'customer_master',
    fields: ['name', 'print_name', 'contact_person', 'address1', 'phone_res', 'phone_off', 'mobile1', 'email', 'gst_number', 'area', 'transport', 'limit_days', 'limit_amount', 'opening_balance', 'balance_type', 'status'],
    uniqueField: 'name'
  },
  supplier_master: {
    table: 'supplier_master',
    fields: ['name', 'print_name', 'contact_person', 'address1', 'phone_res', 'phone_off', 'mobile1', 'email', 'gst_number', 'area', 'transport', 'limit_days', 'limit_amount', 'opening_balance', 'balance_type', 'status'],
    uniqueField: 'name'
  },
  flour_mill_master: {
    table: 'flour_mill_master',
    fields: ['flourmill', 'print_name', 'contact_person', 'address', 'area', 'phone_res', 'phone_off', 'mobile', 'tin_no', 'wages_kg', 'opening_balance', 'opening_balance_type', 'status'],
    uniqueField: 'flourmill'
  },
  papad_company_master: {
    table: 'papad_company_master',
    fields: ['name', 'print_name', 'contact_person', 'address1', 'address2', 'address3', 'address4', 'gst_no', 'phone_off', 'phone_res', 'mobile1', 'mobile2', 'area', 'wages_kg', 'opening_balance', 'opening_advance', 'status'],
    uniqueField: 'name'
  },
  weightmaster: {
    table: 'weightmaster',
    fields: ['name', 'printname', 'weight'],
    uniqueField: 'name'
  },
  ledgergroupmaster: {
    table: 'ledgergroupmaster',
    fields: ['name', 'printname', 'under'],
    uniqueField: 'name'
  },
  ledgermaster: {
    table: 'ledgermaster',
    fields: ['name', 'printname', 'alias_name', 'under', 'openingbalance', 'opening_type', 'ledger_type', 'status'],
    uniqueField: 'name'
  },
  area_master: {
    table: 'area_master',
    fields: ['name', 'print_name', 'status'],
    uniqueField: 'name'
  },
  city_master: {
    table: 'city_master',
    fields: ['name', 'print_name', 'status'],
    uniqueField: 'name'
  },
  transport_master: {
    table: 'transport_master',
    fields: ['name', 'print_name', 'status'],
    uniqueField: 'name'
  },
  consignee_group_master: {
    table: 'consignee_group_master',
    fields: ['name', 'print_name', 'contact_person', 'address', 'area', 'phone_res', 'phone_off', 'mobile', 'tin_no', 'status'],
    uniqueField: 'name'
  },
  sender_group_master: {
    table: 'sender_group_master',
    fields: ['name', 'print_name', 'contact_person', 'address', 'area', 'phone_res', 'phone_off', 'mobile', 'tin_no', 'status'],
    uniqueField: 'name'
  },
  person_master: {
    table: 'person_master',
    fields: ['name', 'print_name', 'contact_person', 'address', 'area', 'phone_res', 'phone_off', 'mobile', 'status'],
    uniqueField: 'name'
  },
  ptrans_master: {
    table: 'ptrans_master',
    fields: ['name', 'print_name', 'status'],
    uniqueField: 'name'
  },
  godown_master: {
    table: 'godown_master',
    fields: ['godown_name', 'print_name', 'contact_person', 'address', 'phone_off', 'mobile1', 'email', 'website', 'area', 'gst_number', 'status'],
    uniqueField: 'godown_name'
  }
}

// Validate master type to prevent SQL injection
const validateMasterType = (type) => {
  if (!type || !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(type)) {
    return null
  }
  // First check if it's directly in aliases
  if (masterTypeAliases[type]) {
    return type
  }
  // Check if it's a table name directly
  if (masterTables[type]) {
    return type
  }
  return null
}

// Get display field name for a master type
const getDisplayField = (type) => {
  const config = masterTypeAliases[type] || masterTables[type]
  return config ? config.displayField : 'name'
}

// Get table config for a master type
const getTableConfig = (type) => {
  return masterTypeAliases[type] || masterTables[type] || null
}

// ============================================================================
// GENERIC API: Get Active records only, ordered by name ASC
// Returns: [{ id: 1, name: "ABC" }]
// ============================================================================
router.get('/:type', async (req, res) => {
  try {
    const type = validateMasterType(req.params.type)
    
    if (!type) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid master type. Valid types: items, item_groups, deduction_sales, deduction_purchase, customers, suppliers, flour_mills, papad_companies, weights, ledger_groups, ledgers, areas, cities, consignees, ptrans, senders, transports' 
      })
    }

    const config = getTableConfig(type)
    if (!config) {
      return res.status(400).json({ message: 'Master configuration not found' })
    }

    const tableName = config.table
    
    // Check if table exists
    const exists = await tableExists(tableName)
    if (!exists) {
      console.log(`Table '${tableName}' does not exist`)
      return res.json([])
    }
    
    const displayField = config.displayField
    const hasStatus = config.hasStatus

    // Build query - filter active only if table has status field
    let query = `SELECT * FROM ${tableName}`
    const params = []
    
    if (hasStatus) {
      query += ` WHERE (status = 'Active' OR status IS NULL OR status = '')`
    }
    
    // Order by name ASC
    query += ` ORDER BY ${displayField} ASC`

    const result = await db.query(query, params)
    
    // Return simplified format [{ id, name }]
    const simplified = result.rows.map(row => ({
      id: row.id,
      name: row[displayField] || row.name || row.item_name || row.ded_name || row.flourmill || ''
    }))

    res.json({ success: true, data: simplified })
  } catch (error) {
    console.error('Error fetching master records:', error)
    res.json([])
  }
})

// ============================================================================
// GET ALL RECORDS (Legacy - returns full records)
// ============================================================================
router.get('/all/:table', async (req, res) => {
  try {
    const tableName = req.params.table
    const tableConfig = masterTables[tableName]

    if (!tableConfig) {
      return res.status(400).json({ message: 'Invalid master table' })
    }

    const result = await db.query(`SELECT * FROM ${tableConfig.table}`)
    res.json({ success: true, data: result.rows })
  } catch (error) {
    console.error('Error fetching master records:', error)
    res.status(500).json({ message: 'Error fetching records', error: error.message })
  }
})

// ============================================================================
// GET SINGLE RECORD BY ID
// ============================================================================
router.get('/record/:table/:id', async (req, res) => {
  try {
    const tableName = req.params.table
    const tableConfig = masterTables[tableName]

    if (!tableConfig) {
      return res.status(400).json({ message: 'Invalid master table' })
    }

    const result = await db.query(`SELECT * FROM ${tableConfig.table} WHERE id = ?`, [req.params.id])

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Record not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error fetching master record:', error)
    res.status(500).json({ message: 'Error fetching record', error: error.message })
  }
})

// ============================================================================
// POST CREATE NEW RECORD - Short form /:table (matches frontend call)
// ============================================================================
router.post("/:table", async (req, res) => {
  try {
    const { table } = req.params;
    const data = req.body;

    console.log("📦 Incoming:", data);

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Empty request body",
      });
    }

    const keys = Object.keys(data);
    const values = Object.values(data);

    const placeholders = keys.map(() => "?").join(",");

    const query = `INSERT INTO ${table} (${keys.join(",")}) VALUES (${placeholders})`;

    db.run(query, values, function (err) {
      if (err) {
        console.error("❌ DB ERROR:", err);
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      res.json({
        success: true,
        id: this.lastID,
      });
    });
  } catch (err) {
    console.error("❌ SERVER ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});


// ============================================================================
// POST CREATE NEW RECORD - Legacy form /record/:table
// ============================================================================
router.post('/record/:table', async (req, res) => {
  try {
    const tableName = req.params.table
    const tableConfig = masterTables[tableName]

    if (!tableConfig) {
      return res.status(400).json({ message: 'Invalid master table' })
    }

    const data = req.body
    const fields = tableConfig.fields
    const values = fields.map(field => {
      // Handle status default
      if (field === 'status' && !data[field]) {
        return 'Active'
      }
      return data[field] || null
    })

    // Check for required fields
    if (fields.includes('name') && !data.name && !data.flourmill) {
      return res.status(400).json({ message: 'Name is required' })
    }
    if (fields.includes('item_name') && !data.item_name) {
      return res.status(400).json({ message: 'Item name is required' })
    }
    if (fields.includes('group_name') && !data.group_name) {
      return res.status(400).json({ message: 'Group name is required' })
    }
    if (fields.includes('ded_name') && !data.ded_name) {
      return res.status(400).json({ message: 'Deduction name is required' })
    }

    const placeholders = fields.map(() => '?').join(', ')
    const query = `INSERT INTO ${tableConfig.table} (${fields.join(', ')}) VALUES (${placeholders})`

    const result = await db.run(query, values)

    res.status(201).json({
      success: true,
      data: { id: result.lastID },
      message: 'Record created successfully'
    })
  } catch (error) {
    console.error("❌ DB INSERT ERROR:", error.message);
    console.error(error);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
})

// ============================================================================
// PUT UPDATE RECORD - Short form /:table/:id (matches frontend call)
// ============================================================================
router.put('/:table/:id', async (req, res) => {
  try {
    const tableName = req.params.table
    const tableConfig = masterTables[tableName]

    if (!tableConfig) {
      return res.status(400).json({ message: 'Invalid master table' })
    }

    const data = req.body
    const fields = tableConfig.fields
    const values = fields.map(field => data[field] || null)
    values.push(req.params.id) // Add ID for WHERE clause

    const setClause = fields.map(field => `${field} = ?`).join(', ')
    const query = `UPDATE ${tableConfig.table} SET ${setClause} WHERE id = ?`

    const result = await db.run(query, values)

    if (result.changes > 0) {
      res.json({ success: true, message: 'Record updated successfully' })
    } else {
      res.status(404).json({ success: false, message: 'Record not found' })
    }
  } catch (error) {
    console.error('Error updating master record:', error)
    res.status(500).json({ message: 'Error updating record', error: error.message })
  }
})

// ============================================================================
// PUT UPDATE RECORD - Legacy form /record/:table/:id
// ============================================================================
router.put('/record/:table/:id', async (req, res) => {
  try {
    const tableName = req.params.table
    const tableConfig = masterTables[tableName]

    if (!tableConfig) {
      return res.status(400).json({ message: 'Invalid master table' })
    }

    const data = req.body
    const fields = tableConfig.fields
    const values = fields.map(field => data[field] || null)
    values.push(req.params.id) // Add ID for WHERE clause

    const setClause = fields.map(field => `${field} = ?`).join(', ')
    const query = `UPDATE ${tableConfig.table} SET ${setClause} WHERE id = ?`

    const result = await db.run(query, values)

    if (result.changes > 0) {
      res.json({ message: 'Record updated successfully' })
    } else {
      res.status(404).json({ message: 'Record not found' })
    }
  } catch (error) {
    console.error('Error updating master record:', error)
    res.status(500).json({ message: 'Error updating record', error: error.message })
  }
})

// ============================================================================
// DELETE RECORD - Short form /:table/:id (matches frontend call)
// ============================================================================
router.delete('/:table/:id', async (req, res) => {
  try {
    const tableName = req.params.table
    const tableConfig = masterTables[tableName]

    if (!tableConfig) {
      return res.status(400).json({ message: 'Invalid master table' })
    }

    const result = await db.run(`DELETE FROM ${tableConfig.table} WHERE id = ?`, [req.params.id])

    if (result.changes > 0) {
      res.json({ success: true, message: 'Record deleted successfully' })
    } else {
      res.status(404).json({ success: false, message: 'Record not found' })
    }
  } catch (error) {
    console.error('Error deleting master record:', error)
    res.status(500).json({ message: 'Error deleting record', error: error.message })
  }
})

// ============================================================================
// DELETE RECORD - Legacy form /record/:table/:id
// ============================================================================
router.delete('/record/:table/:id', async (req, res) => {
  try {
    const tableName = req.params.table
    const tableConfig = masterTables[tableName]

    if (!tableConfig) {
      return res.status(400).json({ message: 'Invalid master table' })
    }

    const result = await db.run(`DELETE FROM ${tableConfig.table} WHERE id = ?`, [req.params.id])

    if (result.changes > 0) {
      res.json({ message: 'Record deleted successfully' })
    } else {
      res.status(404).json({ message: 'Record not found' })
    }
  } catch (error) {
    console.error('Error deleting master record:', error)
    res.status(500).json({ message: 'Error deleting record', error: error.message })
  }
})

// /lots/next - Fallback lot generator
router.get('/lots/next', async (req, res) => {
  try {
  const nextLot = "LOT" + Date.now().toString().slice(-4);
    res.json({ success: true, data: { lot_no: nextLot } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router

