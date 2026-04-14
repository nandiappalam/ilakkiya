/**
 * Ledger Entry Helper Module
 * Provides functions to create ledger entries for various transactions
 */

const db = require('../config/database')

/**
 * Get next voucher number for a given prefix
 * @param {string} prefix - Voucher type prefix (e.g., 'PUR', 'SAL', 'ADV')
 * @returns {string} - Formatted voucher number
 */
async function getNextVoucherNumber(prefix) {
  try {
    const result = await db.query(`
      SELECT voucher_no FROM ledger_entries 
      WHERE voucher_type = ? 
      ORDER BY id DESC LIMIT 1
    `, [prefix])
    
    if (result.rows.length > 0) {
      const lastNo = parseInt(result.rows[0].voucher_no.replace(prefix, '')) || 0
      return `${prefix}${String(lastNo + 1).padStart(5, '0')}`
    }
    return `${prefix}00001`
  } catch (error) {
    console.error('Error generating voucher number:', error)
    return `${prefix}00001`
  }
}

/**
 * Create a single ledger entry
 * @param {object} params - Ledger entry parameters
 */
async function createLedgerEntry({ 
  ledgerName, 
  date, 
  voucherType, 
  voucherNo, 
  debit = 0, 
  credit = 0, 
  referenceId = null, 
  particulars = '' 
}) {
  try {
    // Get ledger ID from ledgermaster
    let ledgerId = null
    try {
      const ledgerResult = await db.query('SELECT id FROM ledgermaster WHERE name = ?', [ledgerName])
      ledgerId = ledgerResult.rows.length > 0 ? ledgerResult.rows[0].id : null
    } catch (e) {
      console.log('Ledger not found:', ledgerName)
    }
    
    await db.run(`
      INSERT INTO ledger_entries (ledger_id, ledger_name, date, voucher_type, voucher_no, debit, credit, reference_id, particulars)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [ledgerId, ledgerName, date, voucherType, voucherNo, debit, credit, referenceId, particulars])
    
    return true
  } catch (error) {
    console.error('Error creating ledger entry:', error)
    return false
  }
}

/**
 * Create purchase ledger entries
 * Creates entries for:
 * - Supplier (Credit) - Net amount
 * - Purchase Account (Debit) - Base amount
 * - Tax/Ledger (Debit) - Tax amount
 * - Discount (Credit) - Discount amount
 */
async function createPurchaseLedgerEntries(purchaseData) {
  const { 
    supplier, 
    date, 
    invNo, 
    purchaseId, 
    baseAmount = 0, 
    taxAmount = 0, 
    discAmount = 0, 
    netAmount = 0 
  } = purchaseData

  const voucherNo = await getNextVoucherNumber('PUR')
  
  try {
    // Supplier Account - Credit (Payable)
    await createLedgerEntry({
      ledgerName: supplier,
      date,
      voucherType: 'Purchase',
      voucherNo,
      debit: 0,
      credit: netAmount,
      referenceId: purchaseId,
      particulars: `Purchase Inv: ${invNo}`
    })

    // Purchase Account - Debit
    if (baseAmount > 0) {
      await createLedgerEntry({
        ledgerName: 'Purchase Account',
        date,
        voucherType: 'Purchase',
        voucherNo,
        debit: baseAmount,
        credit: 0,
        referenceId: purchaseId,
        particulars: `Purchase Inv: ${invNo}`
      })
    }

    // Tax Account - Debit
    if (taxAmount > 0) {
      await createLedgerEntry({
        ledgerName: 'Input Tax',
        date,
        voucherType: 'Purchase',
        voucherNo,
        debit: taxAmount,
        credit: 0,
        referenceId: purchaseId,
        particulars: `Tax on Purchase Inv: ${invNo}`
      })
    }

    // Discount Received - Credit
    if (discAmount > 0) {
      await createLedgerEntry({
        ledgerName: 'Discount Received',
        date,
        voucherType: 'Purchase',
        voucherNo,
        debit: 0,
        credit: discAmount,
        referenceId: purchaseId,
        particulars: `Discount on Purchase Inv: ${invNo}`
      })
    }

    return true
  } catch (error) {
    console.error('Error creating purchase ledger entries:', error)
    return false
  }
}

/**
 * Create sales ledger entries
 * Creates entries for:
 * - Customer (Debit) - Receivable
 * - Sales Account (Credit) - Revenue
 * - Tax (Credit) - Output tax
 */
async function createSalesLedgerEntries(salesData) {
  const { 
    customer, 
    date, 
    invNo, 
    salesId, 
    totalAmount = 0, 
    taxAmount = 0, 
    discAmount = 0 
  } = salesData

  const voucherNo = await getNextVoucherNumber('SAL')
  
  try {
    // Customer Account - Debit (Receivable)
    await createLedgerEntry({
      ledgerName: customer,
      date,
      voucherType: 'Sales',
      voucherNo,
      debit: totalAmount,
      credit: 0,
      referenceId: salesId,
      particulars: `Sales Inv: ${invNo}`
    })

    // Sales Account - Credit
    const salesAmount = totalAmount - taxAmount
    if (salesAmount > 0) {
      await createLedgerEntry({
        ledgerName: 'Sales Account',
        date,
        voucherType: 'Sales',
        voucherNo,
        debit: 0,
        credit: salesAmount,
        referenceId: salesId,
        particulars: `Sales Inv: ${invNo}`
      })
    }

    // Output Tax - Credit
    if (taxAmount > 0) {
      await createLedgerEntry({
        ledgerName: 'Output Tax',
        date,
        voucherType: 'Sales',
        voucherNo,
        debit: 0,
        credit: taxAmount,
        referenceId: salesId,
        particulars: `Tax on Sales Inv: ${invNo}`
      })
    }

    // Discount Allowed - Debit
    if (discAmount > 0) {
      await createLedgerEntry({
        ledgerName: 'Discount Allowed',
        date,
        voucherType: 'Sales',
        voucherNo,
        debit: discAmount,
        credit: 0,
        referenceId: salesId,
        particulars: `Discount on Sales Inv: ${invNo}`
      })
    }

    return true
  } catch (error) {
    console.error('Error creating sales ledger entries:', error)
    return false
  }
}

/**
 * Create advance payment ledger entries
 */
async function createAdvanceLedgerEntries(advanceData) {
  const { 
    papadCompany, 
    date, 
    sNo, 
    advanceId, 
    amount = 0 
  } = advanceData

  const voucherNo = await getNextVoucherNumber('ADV')
  
  try {
    // Cash/Bank - Credit (money going out)
    await createLedgerEntry({
      ledgerName: 'Cash',
      date,
      voucherType: 'Advance',
      voucherNo,
      debit: 0,
      credit: amount,
      referenceId: advanceId,
      particulars: `Advance to: ${papadCompany}, Ref: ${sNo}`
    })

    // Advance to Party - Debit
    await createLedgerEntry({
      ledgerName: papadCompany,
      date,
      voucherType: 'Advance',
      voucherNo,
      debit: amount,
      credit: 0,
      referenceId: advanceId,
      particulars: `Advance Given, Ref: ${sNo}`
    })

    return true
  } catch (error) {
    console.error('Error creating advance ledger entries:', error)
    return false
  }
}

/**
 * Delete ledger entries for a reference
 */
async function deleteLedgerEntries(referenceId) {
  try {
    await db.run('DELETE FROM ledger_entries WHERE reference_id = ?', [referenceId])
    return true
  } catch (error) {
    console.error('Error deleting ledger entries:', error)
    return false
  }
}

module.exports = {
  getNextVoucherNumber,
  createLedgerEntry,
  createPurchaseLedgerEntries,
  createSalesLedgerEntries,
  createAdvanceLedgerEntries,
  deleteLedgerEntries
}
