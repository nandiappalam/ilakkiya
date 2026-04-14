import React from 'react';
import { EntryDisplay } from './entry';

// Column definitions for Flour Out Return Display
const columns = [
  { key: 'date', title: 'Date' },
  { key: 'flour_mill', title: 'Flour Mill' },
  { key: 'item_name', title: 'Item Name' },
  { key: 'lot_no', title: 'Lot No' },
  { key: 'weight', title: 'Weight' },
  { key: 'qty', title: 'Qty' },
  { key: 'total_wt', title: 'Total Wt' },
  { key: 'wages_per_kg', title: 'Wages / Kg' },
  { key: 'wages', title: 'Wages' },
];

// Handle delete
const handleDelete = async (id) => {
  if (!id) {
    alert('Cannot delete: missing record id');
    return;
  }
  if (!window.confirm('Delete this record?')) return;
  try {
    const res = await fetch(`/api/flour-out-return/${id}`, { method: 'DELETE' });
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
  const html = `<html><head><title>Flour Out Return - ${row.date || ''}</title><style>body{font-family:Arial;padding:20px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccc;padding:8px}</style></head><body><h2>Flour Out Return</h2><table><tr><th>Date</th><td>${row.date||''}</td></tr><tr><th>Flour Mill</th><td>${row.flour_mill||''}</td></tr><tr><th>Item Name</th><td>${row.item_name||''}</td></tr></table></body></html>`;
  if (win) { win.document.write(html); win.document.close(); win.focus(); win.print(); }
};

// Handle edit
const handleEdit = (row) => {
  alert('Edit functionality - Record: ' + (row.id || ''));
};

// Custom actions for Flour Out Return
const FlourOutReturnDisplay = () => {
  const customActions = (row) => (
    <>
      <button className="action-btn" onClick={() => handleEdit(row)}>Update</button>
      <button className="action-btn" onClick={() => handlePrint(row)}>Print</button>
      <button className="action-btn danger" onClick={() => handleDelete(row.id)}>Delete</button>
    </>
  );

  return (
    <EntryDisplay
      title="Flour Out Return Display"
      apiEndpoint="/api/flour-out-return"
      columns={columns}
      customActions={customActions}
      addNewLink="/flour-out-return"
    />
  );
};

export default FlourOutReturnDisplay;
