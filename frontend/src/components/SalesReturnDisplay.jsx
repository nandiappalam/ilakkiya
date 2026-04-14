import React from 'react';
import { EntryDisplay } from './entry';

// Column definitions for Sales Return Display
const columns = [
  { key: 's_no', title: 'S.No' },
  { key: 'date', title: 'Date' },
  { key: 'customer', title: 'Customer' },
  { key: 'total_qty', title: 'Total Qty' },
  { key: 'total_amt', title: 'Total Amount' },
];

// Handle delete
const handleDelete = async (id) => {
  if (!id) {
    alert('Cannot delete: missing record id');
    return;
  }
  if (!window.confirm('Delete this record?')) return;
  try {
    const res = await fetch(`/api/sales-returns/${id}`, { method: 'DELETE' });
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
  const html = `<html><head><title>Sales Return - ${row.s_no || ''}</title><style>body{font-family:Arial;padding:20px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccc;padding:8px}</style></head><body><h2>Sales Return</h2><table><tr><th>S.No</th><td>${row.s_no||''}</td></tr><tr><th>Date</th><td>${row.date||''}</td></tr><tr><th>Customer</th><td>${row.customer||''}</td></tr></table></body></html>`;
  if (win) { win.document.write(html); win.document.close(); win.focus(); win.print(); }
};

// Handle edit
const handleEdit = (row) => {
  alert('Edit functionality - Record: ' + (row.id || row.s_no || ''));
};

// Custom actions for Sales Return
const SalesReturnDisplay = () => {
  const customActions = (row) => (
    <>
      <button className="action-btn" onClick={() => handleEdit(row)}>Update</button>
      <button className="action-btn" onClick={() => handlePrint(row)}>Print</button>
      <button className="action-btn danger" onClick={() => handleDelete(row.id)}>Delete</button>
    </>
  );

  return (
    <EntryDisplay
      title="Sales Return Display"
      apiEndpoint="/api/sales-returns"
      columns={columns}
      customActions={customActions}
      addNewLink="/sales-return"
    />
  );
};

export default SalesReturnDisplay;
