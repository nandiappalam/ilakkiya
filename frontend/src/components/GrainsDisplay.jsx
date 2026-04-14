import React from 'react';
import { EntryDisplay } from './entry';

// Column definitions for Grains Display
const columns = [
  { key: 'id', title: 'ID' },
  { key: 'date', title: 'Date' },
  { key: 'supplier', title: 'Supplier' },
  { key: 'grain_type', title: 'Grain Type' },
  { key: 'quantity', title: 'Quantity (kg)' },
  { key: 'rate', title: 'Rate' },
  { key: 'total_amount', title: 'Total Amount' },
];

// Handle delete
const handleDelete = async (id) => {
  if (!id) {
    alert('Cannot delete: missing record id');
    return;
  }
  if (!window.confirm('Delete this record?')) return;
  try {
    const res = await fetch(`/api/grains/${id}`, { method: 'DELETE' });
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
  const html = `<html><head><title>Grains - ${row.id || ''}</title><style>body{font-family:Arial;padding:20px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccc;padding:8px}</style></head><body><h2>Grains</h2><table><tr><th>Date</th><td>${row.date||''}</td></tr><tr><th>Supplier</th><td>${row.supplier||''}</td></tr><tr><th>Grain Type</th><td>${row.grain_type||''}</td></tr></table></body></html>`;
  if (win) { win.document.write(html); win.document.close(); win.focus(); win.print(); }
};

// Handle edit
const handleEdit = (row) => {
  alert('Edit functionality - Record: ' + (row.id || ''));
};

// Custom actions for Grains
const GrainsDisplay = () => {
  const customActions = (row) => (
    <>
      <button className="action-btn" onClick={() => handleEdit(row)}>Update</button>
      <button className="action-btn" onClick={() => handlePrint(row)}>Print</button>
      <button className="action-btn danger" onClick={() => handleDelete(row.id)}>Delete</button>
    </>
  );

  return (
    <EntryDisplay
      title="Grains Display"
      apiEndpoint="/api/grains"
      columns={columns}
      customActions={customActions}
      addNewLink="/grains"
    />
  );
};

export default GrainsDisplay;
