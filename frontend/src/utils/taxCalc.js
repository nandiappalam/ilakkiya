/**
 * Tax Calculation Utilities for ERP Entry Pages
 * Centralized logic for Exclusive/Inclusive tax handling
 * Indian GST compliant
 */

/**
 * Calculate tax for SINGLE ROW
 * @param {Object} row - Row data {qty, rate, disc, tax}
 * @param {string} taxType - 'Exclusive' | 'Inclusive'
 * @param {number} taxRate - Default tax percentage if the row does not provide one
 * @returns {Object} {baseAmount, discountAmount, taxableAmount, taxAmount, totalAmount}
 */
export const calculateRow = (row, taxType, taxRate) => {
  const qty = parseFloat(row.qty) || 0;
  const rate = parseFloat(row.rate) || 0;
  const discPct = parseFloat(row.disc || row.disc_pct || row.discPercent || 0) || 0;
  const taxPct = parseFloat(row.tax || row.tax_rate || row.taxPercent || taxRate || 0) || 0;

  const baseAmount = qty * rate;
  const discountAmount = baseAmount * discPct / 100;
  let taxableAmount = baseAmount - discountAmount;

  let taxAmount = 0;
  let totalAmount = 0;

  if (taxType === 'Inclusive') {
    totalAmount = taxableAmount;
    taxableAmount = totalAmount / (1 + taxPct / 100);
    taxAmount = totalAmount - taxableAmount;
  } else {
    taxAmount = taxableAmount * (taxPct / 100);
    totalAmount = taxableAmount + taxAmount;
  }

  return {
    baseAmount: Number(baseAmount.toFixed(2)),
    discountAmount: Number(discountAmount.toFixed(2)),
    taxableAmount: Number(taxableAmount.toFixed(2)),
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
  const rowTotals = rows.map(row => calculateRow(row, taxType, taxRate));

  const totals = rowTotals.reduce((acc, rowTotal) => ({
    baseAmount: acc.baseAmount + rowTotal.baseAmount,
    discountAmount: acc.discountAmount + rowTotal.discountAmount,
    taxableAmount: acc.taxableAmount + rowTotal.taxableAmount,
    taxAmount: acc.taxAmount + rowTotal.taxAmount,
    totalAmount: acc.totalAmount + rowTotal.totalAmount
  }), { baseAmount: 0, discountAmount: 0, taxableAmount: 0, taxAmount: 0, totalAmount: 0 });

  return {
    baseAmount: Number(totals.baseAmount.toFixed(2)),
    discAmount: Number(totals.discountAmount.toFixed(2)),
    taxableAmount: Number(totals.taxableAmount.toFixed(2)),
    taxAmount: Number(totals.taxAmount.toFixed(2)),
    totalAmount: Number(totals.totalAmount.toFixed(2))
  };
};

