import React from 'react';
import { EntryDisplay } from './entry';
import api from '../utils/api';

// Column definitions for Purchase Display
const columns = [
  { key: 's_no', title: 'S.No' },
  { key: 'date', title: 'Date' },
  { key: 'inv_no', title: 'Inv No' },
  { key: 'supplier', title: 'Supplier' },
  { key: 'type', title: 'Type' },
  { key: 'grand_total', title: 'Total Amount' },
];

// Handle delete - using Tauri API
const handleDelete = async (id, onSuccess) => {
  if (!id) {
    alert('Cannot delete: missing record id');
    return;
  }
  if (!window.confirm('Delete this record?')) return;
  try {
    const result = await api.deletePurchase(id);
    if (result && result.success) {
      alert('Record deleted successfully');
      if (onSuccess) onSuccess();
    } else {
      alert('Delete failed: ' + (result?.message || 'Unknown error'));
    }
  } catch (err) {
    console.error('Delete error:', err);
    alert('Delete failed: ' + err.message);
  }
};

// Handle print
const handlePrint = (row) => {
  const win = window.open('', '_blank');
  const html = `<html><head><title>Purchase - ${row.inv_no || ''}</title><style>body{font-family:Arial;padding:20px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccc;padding:8px}</style></head><body><h2>Purchase</h2><table><tr><th>Inv No</th><td>${row.inv_no||''}</td></tr><tr><th>Date</th><td>${row.date||''}</td></tr><tr><th>Supplier</th><td>${row.supplier||''}</td></tr></table></body></html>`;
  if (win) { win.document.write(html); win.document.close(); win.focus(); win.print(); }
};

// Handle edit
const handleEdit = (row) => {
  alert('Edit functionality - Record: ' + (row.id || row.inv_no || ''));
};

// Custom actions for Purchase
const PurchaseDisplay = () => {
  const customActions = (row, onSuccess) => (
    <>
      <button className="action-btn" onClick={() => handleEdit(row)}>Update</button>
      <button className="action-btn" onClick={() => handlePrint(row)}>Print</button>
      <button className="action-btn danger" onClick={() => handleDelete(row.id, onSuccess)}>Delete</button>
    </>
  );

  return (
    <EntryDisplay
      title="Purchase Display"
      tableName="purchases"
      columns={columns}
      customActions={customActions}
    />
  );
};

export default PurchaseDisplay;
