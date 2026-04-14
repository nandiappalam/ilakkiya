import React from 'react';
import { EntryDisplay } from './entry';

// Column definitions for Flour Out Display
const columns = [
  { key: 'date', title: 'Date' },
  { key: 's_no', title: 'S.No' },
  { key: 'papad_company', title: 'Papad Company' },
  { key: 'item_name', title: 'Item Name' },
  { key: 'lot_no', title: 'Lot No' },
  { key: 'weight', title: 'Weight' },
  { key: 'qty', title: 'Qty' },
  { key: 'total_wt', title: 'Total Wt' },
  { key: 'papad_kg', title: 'Papad Kg' },
];

// Handle delete
const handleDelete = async (id) => {
  if (!id) {
    alert('Cannot delete: missing record id');
    return;
  }
  if (!window.confirm('Delete this record?')) return;
  try {
    const res = await fetch(`/api/flour-out/${id}`, { method: 'DELETE' });
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
  const html = `<html><head><title>Flour Out - ${row.date || ''}</title><style>body{font-family:Arial;padding:20px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccc;padding:8px}</style></head><body><h2>Flour Out</h2><table><tr><th>Date</th><td>${row.date||''}</td></tr><tr><th>Papad Company</th><td>${row.papad_company||''}</td></tr><tr><th>Item Name</th><td>${row.item_name||''}</td></tr></table></body></html>`;
  if (win) { win.document.write(html); win.document.close(); win.focus(); win.print(); }
};

// Handle edit
const handleEdit = (row) => {
  alert('Edit functionality - Record: ' + (row.id || ''));
};

// Custom actions for Flour Out
const FlourOutDisplay = () => {
  const customActions = (row) => (
    <>
      <button className="action-btn" onClick={() => handleEdit(row)}>Update</button>
      <button className="action-btn" onClick={() => handlePrint(row)}>Print</button>
      <button className="action-btn danger" onClick={() => handleDelete(row.id)}>Delete</button>
    </>
  );

  return (
    <EntryDisplay
      title="Flour Out Display"
      apiEndpoint="/api/flour-out"
      columns={columns}
      customActions={customActions}
      addNewLink="/flour-out"
    />
  );
};

export default FlourOutDisplay;
