/**
 * Tax Calculation Utilities for ERP Entry Pages
 * Centralized logic for Exclusive/Inclusive tax handling
 * Indian GST compliant
 */

 /**
  * Calculate tax for SINGLE ROW
  * @param {Object} row - Row data {qty, rate, tax_rate}
  * @param {string} taxType - 'Exclusive' | 'Inclusive'
  * @param {number} taxRate - Tax percentage (e.g. 18 for 18%)
  * @returns {Object} {baseAmount, taxAmount, totalAmount}
  */
export const calculateRow = (row, taxType, taxRate) => {
  const qty = parseFloat(row.qty) || 0;
  const rate = parseFloat(row.rate) || 0;
  const discPct = parseFloat(row.disc || row.disc_pct || 0) || 0;
  const taxPct = parseFloat(taxRate) || 0;
  
  // Step 1: Base amount (qty * rate)
  let baseAmount = qty * rate;
  
  // Step 2: Apply discount
  baseAmount -= baseAmount * discPct / 100;
  
  // Step 3: Calculate tax & total
  let taxAmount = 0;
  let totalAmount = 0;

  if (taxType === 'Inclusive') {
    // Reverse calc for Inclusive: total = base / (1 + tax/100)
    totalAmount = baseAmount;
    baseAmount = totalAmount / (1 + taxPct / 100);
    taxAmount = totalAmount - baseAmount;
  } else { // Exclusive (default)
    taxAmount = baseAmount * (taxPct / 100);
    totalAmount = baseAmount + taxAmount;
  }

  return {
    baseAmount: Number(baseAmount.toFixed(2)),
    taxAmount: Number(taxAmount.toFixed(2)),
    totalAmount: Number(totalAmount.toFixed(2))
  };
};

/**
 * Calculate totals for ALL ROWS
 * @param {Array} rows - Array of row data
 * @param {string} taxType 
 * @param {number} taxRate 
 * @returns {Object} Aggregate totals
 */
export const calculateTotals = (rows, taxType, taxRate) => {
const rowTotals = rows.map(row => calculateRow({...row, tax_rate: row.tax_rate || row.tax || taxRate}, taxType, taxRate));
  
  const totals = rowTotals.reduce((acc, rowTotal) => ({
    baseAmount: acc.baseAmount + rowTotal.baseAmount,
    taxAmount: acc.taxAmount + rowTotal.taxAmount,
    totalAmount: acc.totalAmount + rowTotal.totalAmount
  }), { baseAmount: 0, taxAmount: 0, totalAmount: 0 });

  return {
    billAmt: Number(totals.baseAmount.toFixed(2)),
    taxAmt: Number(totals.taxAmount.toFixed(2)),
    totalAmt: Number(totals.totalAmount.toFixed(2))
  };
};

// Export for convenience
export default {
  calculateRow,
  calculateTotals
};

