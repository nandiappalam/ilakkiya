const express = require('express');
const db = require('../config/database');

const router = express.Router();

// Prefix map for auto voucher number (common format)
const PREFIX_MAP = {
  'Payment': 'VOC',
  'Receipt': 'VOC',
  'Contra': 'VOC',
  'Journal': 'VOC'
};

// Validate voucher data
const validateVoucherData = (data) => {
  const { voucher_type, date, entries, reference_no, narration } = data;

  if (!voucher_type || !['Payment', 'Receipt', 'Contra', 'Journal'].includes(voucher_type)) {
    throw new Error('Invalid voucher_type. Must be Payment, Receipt, Contra, or Journal');
  }
  if (!date) throw new Error('Date is required');
  if (!entries || !Array.isArray(entries) || entries.length < 2) {
    throw new Error('At least 2 entries required');
  }

  let totalDebit = 0, totalCredit = 0;
  for (const entry of entries) {
    if (!entry.ledger_id || entry.ledger_id <= 0) throw new Error('ledger_id required for all entries');
    const debit = Number(entry.debit) || 0;
    const credit = Number(entry.credit) || 0;
    if (debit < 0 || credit < 0) throw new Error('Debit and Credit cannot be negative');
    if (debit > 0 && credit > 0) throw new Error('Only one of debit or credit allowed per entry');
    if (debit === 0 && credit === 0) throw new Error('Entry must have either debit or credit');
    totalDebit += debit;
    totalCredit += credit;
    if (entry.remarks && entry.remarks.length > 500) throw new Error('Remarks too long');
  }

  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    throw new Error(`Totals do not balance: Debit ${totalDebit.toFixed(2)} != Credit ${totalCredit.toFixed(2)}`);
  }

  return true;
};

// Generate auto voucher number (robust)
async function generateVoucherNo(voucher_type) {
  try {
    const prefix = PREFIX_MAP[voucher_type];
    if (!prefix) throw new Error('Invalid voucher_type for numbering');
    const countResult = await db.query(
      'SELECT COUNT(*) as count FROM voucher',
      []
    );
    const nextNum = (countResult.rows[0].count || 0) + 1;
    return `${prefix}${nextNum.toString().padStart(3, '0')}`;
  } catch (err) {
    console.error('generateVoucherNo ERROR:', err);
    return `${PREFIX_MAP[voucher_type] || 'VOC'}001`;
  }
};

// Ensure tables exist (called on load)
async function initTables() {
  try {
    await db.run(`
      CREATE TABLE IF NOT EXISTS voucher (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        voucher_type TEXT NOT NULL,
        voucher_no TEXT UNIQUE NOT NULL,
        date DATE NOT NULL,
        reference_no TEXT,
        narration TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ voucher table ready');
  } catch (err) {
    console.error('voucher table error:', err);
  }

  try {
    await db.run(`
      CREATE TABLE IF NOT EXISTS voucher_entry (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        voucher_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        ledger_id INTEGER NOT NULL,
        debit REAL DEFAULT 0,
        credit REAL DEFAULT 0,
        remarks TEXT,
        FOREIGN KEY (voucher_id) REFERENCES voucher(id) ON DELETE CASCADE,
        FOREIGN KEY (ledger_id) REFERENCES ledgermaster(id)
      )
    `);
    console.log('✓ voucher_entry table ready');
  } catch (err) {
    console.error('voucher_entry table error:', err);
  }
}

initTables().catch(console.error);

// GET /vouchers
router.get('/', async (req, res) => {
  try {
    let query = `
      SELECT v.*, 
      COALESCE(SUM(ve.debit), 0) as total_debit,
      COALESCE(SUM(ve.credit), 0) as total_credit
      FROM voucher v 
      LEFT JOIN voucher_entry ve ON v.id = ve.voucher_id
    `;
    let params = [];
    let conditions = [];
    
    if (req.query.from_date) {
      conditions.push('v.date >= ?');
      params.push(req.query.from_date);
    }
    if (req.query.to_date) {
      conditions.push('v.date <= ?');
      params.push(req.query.to_date);
    }
    if (req.query.voucher_type) {
      conditions.push('v.voucher_type = ?');
      params.push(req.query.voucher_type);
    }
    if (req.query.search) {
      conditions.push('(v.voucher_no LIKE ? OR v.narration LIKE ? OR v.reference_no LIKE ?)');
      const s = `%${req.query.search}%`;
      params.push(s, s, s);
    }
    
    if (conditions.length) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' GROUP BY v.id ORDER BY v.date DESC, v.id DESC';
    
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('GET /vouchers error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Fixed duplicate POST removed

// POST /vouchers - Create
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    validateVoucherData(data);

    // Auto generate voucher_no if not provided
    let voucher_no = data.voucher_no;
    const autoGenerate = !voucher_no;
    if (autoGenerate) {
      voucher_no = await generateVoucherNo(data.voucher_type);
    }

    // Insert voucher master
    const voucherResult = await db.run(
      'INSERT INTO voucher (voucher_type, voucher_no, date, reference_no, narration) VALUES (?, ?, ?, ?, ?)',
      [data.voucher_type, voucher_no, data.date, data.reference_no || '', data.narration || '']
    );
    const voucherId = voucherResult.lastInsertRowid;

    // Insert entries
    for (const entry of data.entries) {
      await db.run(
        'INSERT INTO voucher_entry (voucher_id, type, ledger_id, debit, credit, remarks) VALUES (?, ?, ?, ?, ?, ?)',
        [voucherId, entry.type, entry.ledger_id, entry.debit || 0, entry.credit || 0, entry.remarks || '']
      );
    }

    // Post to ledger_entries
    const ledgerEntries = [];
    for (const entry of data.entries) {
      const lmResult = await db.query('SELECT name FROM ledgermaster WHERE id = ?', [entry.ledger_id]);
      const ledger_name = lmResult.rows[0]?.name || 'Unknown';
      ledgerEntries.push(db.run(
        `INSERT INTO ledger_entries (ledger_id, ledger_name, date, voucher_type, voucher_no, debit, credit, particulars) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [entry.ledger_id, ledger_name, data.date, data.voucher_type, voucher_no, entry.debit || 0, entry.credit || 0, entry.remarks || '']
      ));
    }
    await Promise.all(ledgerEntries);

    // Return created with details
    const created = await db.query(`
      SELECT v.*, SUM(ve.debit) total_debit, SUM(ve.credit) total_credit 
      FROM voucher v LEFT JOIN voucher_entry ve ON v.id = ve.voucher_id 
      WHERE v.id = ? GROUP BY v.id
    `, [voucherId]);
    res.status(201).json(created.rows[0]);
  } catch (err) {
    console.error('POST /vouchers error:', err);
res.status(400).json({ error: err.message });
  }
});

// GET /vouchers/:id - Single with entries
router.get('/:id', async (req, res) => {
  try {
    const voucher = await db.query(`
      SELECT v.*, SUM(ve.debit) total_debit, SUM(ve.credit) total_credit 
      FROM voucher v LEFT JOIN voucher_entry ve ON v.id = ve.voucher_id 
      WHERE v.id = ? GROUP BY v.id
    `, [req.params.id]);
    
    if (voucher.rows.length === 0) return res.status(404).json({ error: 'Voucher not found' });

    const entries = await db.query(`
      SELECT ve.*, lm.name as ledger_name 
      FROM voucher_entry ve 
      LEFT JOIN ledgermaster lm ON ve.ledger_id = lm.id 
      WHERE ve.voucher_id = ?
    `, [req.params.id]);

    res.json({ ...voucher.rows[0], entries: entries.rows });
  } catch (err) {
    console.error('GET /vouchers/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /vouchers/:id - Update (simplified)
router.put('/:id', async (req, res) => {
  try {
    // First delete existing
    await db.run('DELETE FROM voucher_entry WHERE voucher_id = ?', [req.params.id]);
    await db.run('DELETE FROM ledger_entries WHERE voucher_no = (SELECT voucher_no FROM voucher WHERE id = ?)', [req.params.id]);
    
    // Re-use POST logic (simplified)
    const data = req.body;
    const voucher_no = data.voucher_no || await generateVoucherNo(data.voucher_type);
    
    await db.run(`
      UPDATE voucher SET voucher_type = ?, voucher_no = ?, date = ?, reference_no = ?, narration = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `, [data.voucher_type, voucher_no, data.date, data.reference_no || '', data.narration || '', req.params.id]);

    // Insert new entries
    for (const entry of data.entries) {
      await db.run(
        'INSERT INTO voucher_entry (voucher_id, type, ledger_id, debit, credit, remarks) VALUES (?, ?, ?, ?, ?, ?)',
        [req.params.id, entry.type, entry.ledger_id, entry.debit || 0, entry.credit || 0, entry.remarks || '']
      );
    }

    res.json({ message: 'Voucher updated successfully' });
  } catch (err) {
    console.error('PUT /vouchers/:id error:', err);
    res.status(400).json({ error: err.message });
  }
});

// Preview auto voucher number (for frontend)
router.post('/preview-no', async (req, res) => {
  try {
    const { voucher_type } = req.body;
    if (!voucher_type || !PREFIX_MAP[voucher_type]) {
      return res.status(400).json({ error: 'Valid voucher_type required' });
    }
    const voucher_no = await generateVoucherNo(voucher_type);
    res.json({ voucher_no });
  } catch (err) {
    console.error('Preview voucher-no error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /vouchers/:id
router.delete('/:id', async (req, res) => {
  try {
    const voucher = await db.query('SELECT voucher_no FROM voucher WHERE id = ?', [req.params.id]);
    if (voucher.rows.length === 0) return res.status(404).json({ error: 'Not found' });

    await db.run('DELETE FROM voucher WHERE id = ?', [req.params.id]);
    res.json({ message: `Voucher ${voucher.rows[0].voucher_no} deleted` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

