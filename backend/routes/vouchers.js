const express = require('express');
const db = require('../config/database');
const router = express.Router();

let vouchers = []; // Fallback if DB fails

// Validate Dr = Cr
const validateVoucher = (entries) => {
  const dr = entries
    .filter(e => e.type === "Dr")
    .reduce((s, e) => s + Number(e.amount || 0), 0);

  const cr = entries
    .filter(e => e.type === "Cr")
    .reduce((s, e) => s + Number(e.amount || 0), 0);

  if (Math.abs(dr - cr) > 0.01) { // Tolerance for float
    throw new Error(`Debit (${dr}) and Credit (${cr}) must be equal`);
  }
};

// Create vouchers table
async function initVouchersTable() {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS vouchers (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      type TEXT NOT NULL,
      company TEXT NOT NULL,
      entries TEXT NOT NULL, -- JSON array
      createdAt TEXT NOT NULL
    )
  `;
  try {
    await db.run(createTableSQL);
    console.log('✓ vouchers table ready');
  } catch (err) {
    console.error('✗ vouchers table error:', err.message);
  }
}

router.use(async (req, res, next) => {
  await initVouchersTable();
  next();
});

// GET /api/vouchers - List all
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM vouchers ORDER BY createdAt DESC');
    const vouchersWithParsedEntries = result.rows.map(v => ({
      ...v,
      entries: JSON.parse(v.entries)
    }));
    res.json(vouchersWithParsedEntries);
  } catch (err) {
    console.error('GET vouchers error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/vouchers - Create new
router.post('/', async (req, res) => {
  try {
    const { date, type, company, entries } = req.body;

    if (!date || !type || !company || !entries || !Array.isArray(entries)) {
      return res.status(400).json({ error: 'Missing required fields: date, type, company, entries[]' });
    }

    validateVoucher(entries);

    const voucherId = `V${Date.now()}`;
    const createdAt = new Date().toISOString();

    await db.run(
      `INSERT INTO vouchers (id, date, type, company, entries, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
      [voucherId, date, type, company, JSON.stringify(entries), createdAt]
    );

    // Return created voucher with parsed entries
    const createdVoucher = {
      id: voucherId,
      date,
      type,
      company,
      entries,
      createdAt
    };

    res.status(201).json(createdVoucher);
  } catch (err) {
    console.error('POST voucher error:', err);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

