import React from 'react';
import { EntryDisplay } from './entry';

// Column definitions for Sales Export Display
const columns = [
  { key: 'bill_no', title: 'Bill No' },
  { key: 'date', title: 'Date' },
  { key: 'customer', title: 'Customer' },
  { key: 'kind_of_package', title: 'Kind of Package' },
  { key: 'description', title: 'Description' },
  { key: 'lot_no', title: 'Lot No' },
  { key: 'qty', title: 'Qty' },
  { key: 'usd_rate', title: 'USD Rate' },
  { key: 'conv_rate', title: 'Conv Rate' },
  { key: 'usd_amt', title: 'USD Amt' },
  { key: 'inr_amt', title: 'INR Amt' },
  { key: 'tax_percent', title: 'Tax %' },
  { key: 'amount', title: 'Amount' },
  { key: 'bill_amt', title: 'Bill Amt' },
  { key: 'tax_amt', title: 'Tax Amt' },
  { key: 'total', title: 'Total' },
];

// Handle delete
const handleDelete = async (id) => {
  if (!id) {
    alert('Cannot delete: missing record id');
    return;
  }
  if (!window.confirm('Delete this record?')) return;
  try {
    const res = await fetch(`/api/sales-export/${id}`, { method: 'DELETE' });
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
  const html = `<html><head><title>Sales Export - ${row.bill_no || ''}</title><style>body{font-family:Arial;padding:20px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccc;padding:8px}</style></head><body><h2>Sales Export</h2><table><tr><th>Bill No</th><td>${row.bill_no||''}</td></tr><tr><th>Date</th><td>${row.date||''}</td></tr><tr><th>Customer</th><td>${row.customer||''}</td></tr></table></body></html>`;
  if (win) { win.document.write(html); win.document.close(); win.focus(); win.print(); }
};

// Handle edit
const handleEdit = (row) => {
  alert('Edit functionality - Record: ' + (row.id || row.bill_no || ''));
};

// Custom actions for Sales Export
const SalesExportDisplay = () => {
  const customActions = (row) => (
    <>
      <button className="action-btn" onClick={() => handleEdit(row)}>Update</button>
      <button className="action-btn" onClick={() => handlePrint(row)}>Print</button>
      <button className="action-btn danger" onClick={() => handleDelete(row.id)}>Delete</button>
    </>
  );

  return (
    <EntryDisplay
      title="Sales Export Display"
      apiEndpoint="/api/sales-export"
      columns={columns}
      customActions={customActions}
      addNewLink="/sales-export"
    />
  );
};

export default SalesExportDisplay;
