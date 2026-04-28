// Standalone auto-migration module
// Usage: require('./autoMigrate')()
const db = require('./config/database');

const safeAddColumn = async (table, column, def) => {
  try {
    await db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${def}`);
    console.log(`✓ Added ${column} to ${table}`);
  } catch (err) {
    if (err.message && err.message.includes('duplicate column')) {
      console.log(`✓ ${column} already exists in ${table}`);
    } else {
      console.log(`✗ Error adding ${column} to ${table}:`, err.message);
    }
  }
};

module.exports = async function autoMigrate() {
  console.log('🔧 Running auto-migrations...');

  await safeAddColumn('item_master', 'type', "TEXT DEFAULT 'Urad'");
  await safeAddColumn('godown_master', 'contact_person', 'TEXT');
  await safeAddColumn('godown_master', 'address', 'TEXT');
  await safeAddColumn('godown_master', 'phone_off', 'TEXT');
  await safeAddColumn('godown_master', 'mobile1', 'TEXT');
  await safeAddColumn('godown_master', 'email', 'TEXT');
  await safeAddColumn('godown_master', 'website', 'TEXT');
  await safeAddColumn('godown_master', 'area', 'TEXT');
  await safeAddColumn('godown_master', 'gst_number', 'TEXT');

  await safeAddColumn('deduction_purchase', 'affect_cost_of_goods', "TEXT DEFAULT 'No'");
  await safeAddColumn('deduction_purchase', 'type', "TEXT DEFAULT 'Add'");
  await safeAddColumn('deduction_purchase', 'debit_side_adjust', "TEXT DEFAULT 'None'");
  await safeAddColumn('deduction_purchase', 'deduction_type', "TEXT DEFAULT 'Add'");
  await safeAddColumn('deduction_purchase', 'calculation_type', "TEXT DEFAULT 'Percentage'");
  await safeAddColumn('deduction_purchase', 'deduction_value', 'REAL DEFAULT 0');
  await safeAddColumn('deduction_purchase', 'status', "TEXT DEFAULT 'Active'");

  await safeAddColumn('customer_master', 'email', 'TEXT');
  await safeAddColumn('customer_master', 'transport', 'TEXT');
  await safeAddColumn('customer_master', 'limit_days', 'INTEGER');
  await safeAddColumn('customer_master', 'limit_amount', 'REAL');
  await safeAddColumn('customer_master', 'balance_type', "TEXT DEFAULT 'Dr'");
  await safeAddColumn('customer_master', 'status', "TEXT DEFAULT 'Active'");
  await safeAddColumn('supplier_master', 'email', 'TEXT');
  await safeAddColumn('supplier_master', 'transport', 'TEXT');
  await safeAddColumn('supplier_master', 'limit_days', 'INTEGER');
  await safeAddColumn('supplier_master', 'limit_amount', 'REAL');
  await safeAddColumn('supplier_master', 'balance_type', "TEXT DEFAULT 'Dr'");
  await safeAddColumn('supplier_master', 'status', "TEXT DEFAULT 'Active'");

  // Item groups status
  await safeAddColumn('item_groups', 'status', "TEXT DEFAULT 'Active'");

  // Ledger master new fields
  await safeAddColumn('ledgermaster', 'alias_name', 'TEXT');
  await safeAddColumn('ledgermaster', 'opening_type', "TEXT DEFAULT 'Dr'");
  await safeAddColumn('ledgermaster', 'ledger_type', "TEXT DEFAULT 'General'");
  await safeAddColumn('ledgermaster', 'status', "TEXT DEFAULT 'Active'");

  // Papad company master new fields
  await safeAddColumn('papad_company_master', 'email', 'TEXT');

  // Papad company entry table
  try {
    await db.run(`CREATE TABLE IF NOT EXISTS papad_company_entry (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      from_date TEXT,
      to_date TEXT,
      papad_per_bag REAL DEFAULT 0,
      wages_per_bag REAL DEFAULT 0,
      advance_deduction_per_bag REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES papad_company_master(id) ON DELETE CASCADE
    )`);
    console.log('✓ Table papad_company_entry is ready');
  } catch (err) {
    console.log('✗ Error creating papad_company_entry:', err.message);
  }

  console.log('✅ Auto-migrations complete');
};
