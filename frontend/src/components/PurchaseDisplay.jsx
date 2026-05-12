import React from 'react';
import { useNavigate } from 'react-router-dom';
import { EntryDisplay } from './entry';
import { deletePurchase } from '../utils/api';

// Column definitions for Purchase Display
const columns = [
  { key: 'inv_no', title: 'Invoice' },
  { key: 'date', title: 'Date' },
  { key: 'supplier_name', title: 'Supplier' },
  { 
    key: 'address',
    title: 'Address',
    render: (row) => row.address?.split('\n')[0] || ''
  },

  { key: 'item_name', title: 'Item' },
  { key: 'lot_no', title: 'Lot No' },

  { key: 'weight', title: 'Weight' },
  { key: 'total_weight', title: 'Total Wt' },

  { key: 'rate', title: 'Rate' },

  { key: 'base_amount', title: 'Base Amt' },

  { key: 'disc_percent', title: 'Disc%' },
  { key: 'disc_amount', title: 'Disc Amt' },

  { key: 'tax_percent', title: 'Tax%' },
  { key: 'tax_amount', title: 'Tax Amt' },

  { key: 'amount', title: 'Amount' },

  { key: 'deduction_amount', title: 'Deduction' },

  { key: 'grand_total', title: 'Total' }
];


// Handle delete - using Tauri API
const handleDelete = async (id, onSuccess) => {
  if (!id) {
    alert('Cannot delete: missing record id');
    return;
  }
  if (!window.confirm('Delete this record?')) return;
  try {
    const result = await deletePurchase(id);
    if (result && (result.success || result.message)) {
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
  const html = `
    <html>
      <head>
        <title>Purchase - ${row.inv_no || ''}</title>
        <style>
          body { font-family: Arial; padding: 20px; }
          h2 { color: #1f4fb2; }
          table { border-collapse: collapse; width: 100%; margin-top: 15px; }
          th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
          th { background: #1f4fb2; color: white; font-weight: bold; }
          tr:nth-child(even) { background: #f0f6ff; }
        </style>
      </head>
      <body>
        <h2>Purchase Receipt</h2>
        <table>
          <tr><th>S.No</th><td>${row.s_no || ''}</td></tr>
          <tr><th>Invoice No</th><td>${row.inv_no || ''}</td></tr>
          <tr><th>Date</th><td>${row.date || ''}</td></tr>
          <tr><th>Supplier</th><td>${row.supplier_name || ''}</td></tr>
          <tr><th>Address</th><td>${row.address || ''}</td></tr>

          <tr><th>Item</th><td>${row.item_name || ''}</td></tr>
          <tr><th>Lot No</th><td>${row.lot_no || ''}</td></tr>
          <tr><th>Qty</th><td>${row.weight || ''}</td></tr>
          <tr><th>Rate</th><td>${row.rate || ''}</td></tr>
          <tr><th>Amount</th><td>${row.amount || ''}</td></tr>
          <tr><th>Tax</th><td>${row.tax_amount || ''}</td></tr>
          <tr><th>Total</th><td>${row.grand_total || row.amount || ''}</td></tr>


        </table>
      </body>
    </html>
  `;
  if (win) { 
    win.document.write(html); 
    win.document.close(); 
    win.focus(); 
    win.print(); 
  }
};

// Handle edit
const handleEdit = (row, navigate) => {
  if (!row.id) {
    alert('Cannot edit: missing record id');
    return;
  }
  // Navigate to edit page with purchase ID
  navigate(`/purchase/edit/${row.id}`);
};

// Custom actions for Purchase
const PurchaseDisplay = () => {
  const navigate = useNavigate();

  const customActions = (row, onSuccess) => (
    <>
      <button className="action-btn" onClick={() => handleEdit(row, navigate)}>Update</button> {/* Already correctly navigates */}
      <button className="action-btn" onClick={() => handlePrint(row)}>Print</button>
      <button className="action-btn danger" onClick={() => handleDelete(row.id, onSuccess)}>Delete</button>
    </>
  );

  return (
    <EntryDisplay
      title="Purchase Display"
      apiEndpoint="/api/purchases/purchase-list"
      columns={columns}
      customActions={customActions}
    />
  );
};

export default PurchaseDisplay;
