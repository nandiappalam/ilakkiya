import React from 'react';
import { EntryDisplay } from './entry';

// Column definitions for Advance Display
const columns = [
  { key: 's_no', title: 'Adv No' },
  { key: 'date', title: 'Date' },
  { key: 'papad_company', title: 'Papad Company' },
  { key: 'amount', title: 'Amount' },
  { key: 'dr_cr', title: 'Type' },
  { key: 'pay_mode', title: 'Pay Mode' },
  { key: 'remarks', title: 'Remarks' },
];

// Handle delete
const handleDelete = async (id) => {
  if (!id) {
    alert('Cannot delete: missing record id');
    return;
  }
  if (!window.confirm('Delete this record?')) return;
  try {
    const res = await fetch(`/api/advances/${id}`, { method: 'DELETE' });
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
  const html = `<html><head><title>Advance - ${row.s_no || ''}</title><style>body{font-family:Arial;padding:20px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccc;padding:8px}</style></head><body><h2>Advance</h2><table><tr><th>Adv No</th><td>${row.s_no||''}</td></tr><tr><th>Date</th><td>${row.date||''}</td></tr><tr><th>Papad Company</th><td>${row.papad_company||''}</td></tr><tr><th>Amount</th><td>${row.amount||''}</td></tr></table></body></html>`;
  if (win) { win.document.write(html); win.document.close(); win.focus(); win.print(); }
};

// Handle edit
const handleEdit = (row) => {
  alert('Edit functionality - Record: ' + (row.id || row.s_no || ''));
};

// Custom actions for Advance
const AdvanceDisplay = () => {
  const customActions = (row) => (
    <>
      <button className="action-btn" onClick={() => handleEdit(row)}>Update</button>
      <button className="action-btn" onClick={() => handlePrint(row)}>Print</button>
      <button className="action-btn danger" onClick={() => handleDelete(row.id)}>Delete</button>
    </>
  );

  return (
    <EntryDisplay
      title="Advance Display"
      apiEndpoint="/api/advances"
      columns={columns}
      customActions={customActions}
    />
  );
};

export default AdvanceDisplay;
