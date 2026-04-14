import React from 'react';
import { EntryDisplay } from './entry';

// Column definitions for Papad In Display
const columns = [
  { key: 's_no', title: 'S.No' },
  { key: 'date', title: 'Date' },
  { key: 'papad_company', title: 'Papad Company' },
  { key: 'item_name', title: 'Item Name' },
  { key: 'lot_no', title: 'Lot No' },
  { key: 'kg', title: 'Kg' },
];

// Handle delete
const handleDelete = async (id) => {
  if (!id) {
    alert('Cannot delete: missing record id');
    return;
  }
  if (!window.confirm('Delete this record?')) return;
  try {
    const res = await fetch(`/api/papad-in/${id}`, { method: 'DELETE' });
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
  const html = `<html><head><title>Papad In - ${row.date || ''}</title><style>body{font-family:Arial;padding:20px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccc;padding:8px}</style></head><body><h2>Papad In</h2><table><tr><th>Date</th><td>${row.date||''}</td></tr><tr><th>Papad Company</th><td>${row.papad_company||''}</td></tr><tr><th>Item Name</th><td>${row.item_name||''}</td></tr></table></body></html>`;
  if (win) { win.document.write(html); win.document.close(); win.focus(); win.print(); }
};

// Handle edit
const handleEdit = (row) => {
  alert('Edit functionality - Record: ' + (row.id || ''));
};

// Custom actions for Papad In
const PapadInDisplay = () => {
  const customActions = (row) => (
    <>
      <button className="action-btn" onClick={() => handleEdit(row)}>Update</button>
      <button className="action-btn" onClick={() => handlePrint(row)}>Print</button>
      <button className="action-btn danger" onClick={() => handleDelete(row.id)}>Delete</button>
    </>
  );

  return (
    <EntryDisplay
      title="Papad In Display"
      apiEndpoint="/api/papad-in"
      columns={columns}
      customActions={customActions}
      addNewLink="/papad-in"
    />
  );
};

export default PapadInDisplay;
