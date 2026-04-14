import React from 'react';
import { EntryDisplay } from './entry';

// Column definitions for Purchase Return Display
const columns = [
  { key: 's_no', title: 'S.No' },
  { key: 'date', title: 'Date' },
  { key: 'return_inv_no', title: 'Return Inv No' },
  { key: 'supplier', title: 'Supplier' },
  { key: 'type', title: 'Type' },
  { key: 'total_qty', title: 'Total Qty' },
  { key: 'total_weight', title: 'Total Weight' },
  { key: 'total_amount', title: 'Total Amount' },
  { key: 'grand_total', title: 'Grand Total' },
];

// Handle delete
const handleDelete = async (id) => {
  if (!id) {
    alert('Cannot delete: missing record id');
    return;
  }
  if (!window.confirm('Delete this record?')) return;
  try {
    const res = await fetch(`/api/purchase-returns/${id}`, { method: 'DELETE' });
    if (res.ok) {
      window.location.reload();
    }
  } catch (err) {
    console.error(err);
  }
};

// Handle print
const handlePrint = (row) => {
  const win = window.open('', '_blank');
  const html = `<html><head><title>Purchase Return - ${row.return_inv_no || ''}</title><style>body{font-family:Arial;padding:20px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccc;padding:8px}</style></head><body><h2>Purchase Return</h2><table><tr><th>Return Inv No</th><td>${row.return_inv_no||''}</td></tr><tr><th>Date</th><td>${row.date||''}</td></tr><tr><th>Supplier</th><td>${row.supplier||''}</td></tr></table></body></html>`;
  if (win) { win.document.write(html); win.document.close(); win.focus(); win.print(); }
};

// Handle edit
const handleEdit = (row) => {
  alert('Edit functionality - Record: ' + (row.id || row.return_inv_no || ''));
};

// Custom actions for Purchase Return
const PurchaseReturnDisplay = () => {
  const customActions = (row) => (
    <>
      <button className="action-btn" onClick={() => handleEdit(row)}>Update</button>
      <button className="action-btn" onClick={() => handlePrint(row)}>Print</button>
      <button className="action-btn danger" onClick={() => handleDelete(row.id)}>Delete</button>
    </>
  );

  return (
    <EntryDisplay
      title="Purchase Return Display"
      apiEndpoint="/api/purchase-returns"
      columns={columns}
      customActions={customActions}
      addNewLink="/purchase-return"
    />
  );
};

export default PurchaseReturnDisplay;
