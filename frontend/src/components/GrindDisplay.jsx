import React from 'react';
import { EntryDisplay } from './entry';

// Column definitions for Grind Display
const columns = [
  { key: 'date', title: 'Date' },
  { key: 'item_name', title: 'Item Name' },
  { key: 'lot_no', title: 'Lot No' },
  { key: 'weight', title: 'Weight' },
  { key: 'qty', title: 'Qty' },
  { key: 'total_wt', title: 'Total Wt' },
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
    const res = await fetch(`/api/grind/${id}`, { method: 'DELETE' });
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
  const html = `<html><head><title>Grind - ${row.date || ''}</title><style>body{font-family:Arial;padding:20px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccc;padding:8px}</style></head><body><h2>Grind</h2><table><tr><th>Date</th><td>${row.date||''}</td></tr><tr><th>Item Name</th><td>${row.item_name||''}</td></tr><tr><th>Lot No</th><td>${row.lot_no||''}</td></tr></table></body></html>`;
  if (win) { win.document.write(html); win.document.close(); win.focus(); win.print(); }
};

// Handle edit
const handleEdit = (row) => {
  alert('Edit functionality - Record: ' + (row.id || ''));
};

// Custom actions for Grind
const GrindDisplay = () => {
  const customActions = (row) => (
    <>
      <button className="action-btn" onClick={() => handleEdit(row)}>Update</button>
      <button className="action-btn" onClick={() => handlePrint(row)}>Print</button>
      <button className="action-btn danger" onClick={() => handleDelete(row.id)}>Delete</button>
    </>
  );

  return (
    <EntryDisplay
      title="Grind Display"
      apiEndpoint="/api/grind"
      columns={columns}
      customActions={customActions}
      addNewLink="/grind"
    />
  );
};

export default GrindDisplay;
