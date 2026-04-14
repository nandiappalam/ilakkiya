# Quick Implementation Guide - Component Conversion Examples

**For**: Developers converting React components  
**Purpose**: Step-by-step examples for common modules  
**Date**: February 5, 2026

---

## Quick Reference: Key Templates

### ✅ Available Templates
- **StandardCreatePage.jsx** - Complete working template
- **StandardCreatePage.css** - Complete working CSS
- **StandardDisplayPage.jsx** - Complete working template
- **StandardDisplayPage.css** - Complete working CSS

**Usage**: Copy → Rename → Customize → Test

---

## Example 1: Converting Advance Module

### Current File Locations
```
Entry/advance C.html      ← Create format reference
Entry/advance D.html      ← Display format reference
Entry/standard.css        ← Styling reference

Components to convert:
frontend/src/components/AdvanceCreate.jsx
frontend/src/components/AdvanceDisplay.jsx
```

### Step 1: Create AdvanceCreate.jsx

Start with StandardCreatePage.jsx template and modify:

```jsx
import React, { useState } from 'react';
import './AdvanceCreate.css';

const AdvanceCreate = () => {
  const [formData, setFormData] = useState({
    sno: '',
    date: '',
    papadCompany: '',
    amount: '',
    drCr: 'Dr',
    payMode: '',
    remarks: '',
    status: 'Active'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.date || formData.date.trim() === '') {
      setMessage('Date is required');
      setMessageType('error');
      return;
    }
    if (!formData.papadCompany || formData.papadCompany.trim() === '') {
      setMessage('Papad Company is required');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/entry/advance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setMessage('Advance saved successfully!');
        setMessageType('success');
        setFormData({
          sno: '',
          date: '',
          papadCompany: '',
          amount: '',
          drCr: 'Dr',
          payMode: '',
          remarks: '',
          status: 'Active'
        });
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Error saving advance. Please try again.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Network error. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-container">
      {/* Top Bar */}
      <div className="top-bar">
        <span>Inventory Management System</span>
        <span>A.S. MOORTHY & CO</span>
      </div>

      {/* Page Title */}
      <div className="page-title">Advance Creation</div>

      {/* Form Container */}
      <div className="form-wrapper">
        <form className="entry-form" onSubmit={handleSubmit}>
          {/* Message Box */}
          {message && (
            <div className={`message-box ${messageType}`}>
              {message}
            </div>
          )}

          {/* Form Fields */}
          <div className="row">
            <label>S.No</label>
            <span>:</span>
            <input
              type="text"
              name="sno"
              value={formData.sno}
              onChange={handleChange}
              style={{ width: '60px' }}
            />
          </div>

          <div className="row">
            <label>Date</label>
            <span>:</span>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              style={{ width: '150px' }}
            />
          </div>

          <div className="row">
            <label>Papad Company</label>
            <span>:</span>
            <input
              type="text"
              name="papadCompany"
              value={formData.papadCompany}
              onChange={handleChange}
              style={{ width: '220px' }}
              placeholder="Select or enter company"
            />
          </div>

          <div className="row">
            <label>Amount</label>
            <span>:</span>
            <input
              type="text"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              style={{ width: '150px' }}
              placeholder="Enter amount"
            />
            <input
              type="text"
              name="drCr"
              value={formData.drCr}
              style={{ width: '60px' }}
              disabled
            />
          </div>

          <div className="row">
            <label>Pay Mode</label>
            <span>:</span>
            <select
              name="payMode"
              value={formData.payMode}
              onChange={handleChange}
              style={{ width: '220px' }}
            >
              <option value="">Select Pay Mode</option>
              <option value="Cash">Cash</option>
              <option value="Cheque">Cheque</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>

          <div className="row">
            <label>Remarks</label>
            <span>:</span>
            <input
              type="text"
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              style={{ width: '400px' }}
              placeholder="Enter remarks"
            />
          </div>

          {/* SAVE Button */}
          <div className="btn-row">
            <button
              type="submit"
              className="save-btn"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdvanceCreate;
```

### Step 2: Create AdvanceCreate.css

Use StandardCreatePage.css and keep as is (or create component-specific styling):

```css
/* AdvanceCreate.css */
@import url('./StandardCreatePage.css');

/* Component-specific overrides (if needed) */
.entry-form {
  width: 500px;
  /* Keep standard styling */
}
```

### Step 3: Create AdvanceDisplay.jsx

```jsx
import React, { useState, useEffect } from 'react';
import './AdvanceDisplay.css';

const AdvanceDisplay = () => {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [message, setMessage] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    filterByDate();
  }, [records, startDate, endDate]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/entry/advance');
      if (response.ok) {
        const data = await response.json();
        setRecords(Array.isArray(data) ? data : []);
      } else {
        setMessage('Error loading records');
        setRecords([]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Network error');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const filterByDate = () => {
    let filtered = records;
    if (startDate && endDate) {
      filtered = records.filter(r => r.date >= startDate && r.date <= endDate);
    }
    setFilteredRecords(filtered);
  };

  const handleUpdate = (record) => {
    setEditData(record);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/entry/advance/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          setMessage('Record deleted successfully!');
          setTimeout(() => setMessage(''), 3000);
          fetchRecords();
        }
      } catch (error) {
        setMessage('Error deleting record');
      }
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const html = `
      <html>
        <head>
          <title>Advance Report</title>
          <style>
            body { font-family: Arial; padding: 20px; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
            th { background: #f0f0f0; }
          </style>
        </head>
        <body>
          <h2>Advance Report</h2>
          <table>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Adv No</th>
                <th>Date</th>
                <th>Papad Company</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Pay Mode</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              ${filteredRecords.map((r, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td>${r.advance_no || '-'}</td>
                  <td>${r.date || '-'}</td>
                  <td>${r.papad_company || '-'}</td>
                  <td>${r.amount || '-'}</td>
                  <td>${r.type || '-'}</td>
                  <td>${r.pay_mode || '-'}</td>
                  <td>${r.remarks || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.print();
  };

  const handleSaveUpdate = async () => {
    const id = editData.id || editData._id;
    try {
      const response = await fetch(`http://localhost:5000/api/entry/advance/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });
      if (response.ok) {
        setMessage('Record updated successfully!');
        setTimeout(() => setMessage(''), 3000);
        setShowModal(false);
        fetchRecords();
      }
    } catch (error) {
      setMessage('Error updating record');
    }
  };

  return (
    <div className="display-container">
      {/* Top Bar */}
      <div className="top-bar">
        <span>Inventory Management System</span>
        <span>A.S. MOORTHY & CO</span>
      </div>

      {/* Page Title */}
      <div className="page-title">Advance Display</div>

      {/* Content Area */}
      <div className="content-wrapper">
        {/* Message Box */}
        {message && <div className={`message-box`}>{message}</div>}

        {/* Filter Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px',
          marginBottom: '10px',
          padding: '10px',
          backgroundColor: '#d6deef'
        }}>
          <label>Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ width: '120px' }}
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ width: '120px' }}
          />
        </div>

        {/* Table Wrapper */}
        <div className="table-wrapper">
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>Loading records...</div>
          ) : filteredRecords.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>No records found</div>
          ) : (
            <table className="grid-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Adv No</th>
                  <th>Date</th>
                  <th>Papad Company</th>
                  <th>Amount</th>
                  <th>Type</th>
                  <th>Pay Mode</th>
                  <th>Remarks</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record, idx) => (
                  <tr key={record.id || idx}>
                    <td>{idx + 1}</td>
                    <td>{record.advance_no || '-'}</td>
                    <td>{record.date || '-'}</td>
                    <td>{record.papad_company || '-'}</td>
                    <td>{record.amount || '-'}</td>
                    <td>{record.type || '-'}</td>
                    <td>{record.pay_mode || '-'}</td>
                    <td>{record.remarks || '-'}</td>
                    <td className="actions-cell">
                      <button
                        className="action-btn update-btn"
                        onClick={() => handleUpdate(record)}
                      >
                        Update
                      </button>
                      <button
                        className="action-btn print-btn"
                        onClick={handlePrint}
                      >
                        Print
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(record.id || record._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="footer-bar">
          <div>Rows: {filteredRecords.length}</div>
          <button
            className="refresh-btn"
            onClick={fetchRecords}
            style={{
              background: 'linear-gradient(135deg, #4a74b5 0%, #355f9f 100%)',
              color: 'white',
              border: 'none',
              padding: '6px 12px',
              cursor: 'pointer',
              borderRadius: '3px'
            }}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Modal for Update */}
      {showModal && editData && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Update Advance</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Date:</label>
                <input
                  type="date"
                  value={editData.date || ''}
                  onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Papad Company:</label>
                <input
                  type="text"
                  value={editData.papad_company || ''}
                  onChange={(e) => setEditData({ ...editData, papad_company: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Amount:</label>
                <input
                  type="text"
                  value={editData.amount || ''}
                  onChange={(e) => setEditData({ ...editData, amount: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Pay Mode:</label>
                <select
                  value={editData.pay_mode || ''}
                  onChange={(e) => setEditData({ ...editData, pay_mode: e.target.value })}
                >
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              <div className="form-group">
                <label>Remarks:</label>
                <input
                  type="text"
                  value={editData.remarks || ''}
                  onChange={(e) => setEditData({ ...editData, remarks: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="modal-btn save-btn" onClick={handleSaveUpdate}>
                Save
              </button>
              <button className="modal-btn cancel-btn" onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvanceDisplay;
```

### Step 4: Create AdvanceDisplay.css

```css
/* AdvanceDisplay.css */
@import url('./StandardDisplayPage.css');

/* Component-specific overrides (if needed) */
.grid-table {
  font-size: 12px;
}
```

---

## Example 2: Converting Sales Module

### Key Differences
- More form fields (20+)
- Complex layout with multiple sections
- Line items table
- Dropdown dependencies (Customer → Area → Salesman)

### Template for SalesCreate.jsx

```jsx
import React, { useState, useEffect } from 'react';
import './SalesCreate.css';

const SalesCreate = () => {
  const [customers, setCustomers] = useState([]);
  const [areas, setAreas] = useState([]);
  const [salesmen, setSalesmen] = useState([]);
  const [items, setItems] = useState([]);
  
  const [formData, setFormData] = useState({
    salesDate: '',
    invoiceNo: '',
    customerId: '',
    areaId: '',
    salesmanId: '',
    dueDate: '',
    totalAmount: 0,
    taxAmount: 0,
    discountAmount: 0,
    netAmount: 0,
    remarks: '',
    status: 'Active'
  });

  const [lineItems, setLineItems] = useState([
    { itemId: '', quantity: '', rate: '', amount: 0 }
  ]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch customers, areas, salesmen, items on mount
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [customersRes, areasRes, salespersonRes, itemsRes] = await Promise.all([
        fetch('http://localhost:5000/api/masters/customer_master'),
        fetch('http://localhost:5000/api/masters/area'),
        fetch('http://localhost:5000/api/masters/salesman'),
        fetch('http://localhost:5000/api/masters/item')
      ]);

      const customersData = await customersRes.json();
      const areasData = await areasRes.json();
      const salespersonData = await salespersonRes.json();
      const itemsData = await itemsRes.json();

      setCustomers(Array.isArray(customersData) ? customersData : []);
      setAreas(Array.isArray(areasData) ? areasData : []);
      setSalesmen(Array.isArray(salespersonData) ? salespersonData : []);
      setItems(Array.isArray(itemsData) ? itemsData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage('Error loading form data');
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLineItemChange = (index, field, value) => {
    const newItems = [...lineItems];
    newItems[index][field] = value;
    
    // Calculate amount if quantity and rate are present
    if (field === 'quantity' || field === 'rate') {
      const qty = parseFloat(newItems[index].quantity) || 0;
      const rate = parseFloat(newItems[index].rate) || 0;
      newItems[index].amount = qty * rate;
    }
    
    setLineItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.salesDate) {
      setMessage('Sales Date is required');
      return;
    }
    if (!formData.customerId) {
      setMessage('Customer is required');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/entry/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          lineItems: lineItems.filter(item => item.itemId)
        })
      });

      if (response.ok) {
        setMessage('Sales order saved successfully!');
        // Reset form
        setFormData({
          salesDate: '',
          invoiceNo: '',
          customerId: '',
          areaId: '',
          salesmanId: '',
          dueDate: '',
          totalAmount: 0,
          taxAmount: 0,
          discountAmount: 0,
          netAmount: 0,
          remarks: '',
          status: 'Active'
        });
        setLineItems([{ itemId: '', quantity: '', rate: '', amount: 0 }]);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Error saving sales order');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-container">
      <div className="top-bar">
        <span>Inventory Management System</span>
        <span>A.S. MOORTHY & CO</span>
      </div>

      <div className="page-title">Sales Creation</div>

      <div className="form-wrapper">
        <form className="entry-form" onSubmit={handleSubmit}>
          {message && <div className={`message-box ${message.includes('Error') ? 'error' : 'success'}`}>{message}</div>}

          {/* Sales Header Section */}
          <h3 style={{ color: '#1f3f67', borderBottom: '1px solid #7b8fb3', paddingBottom: '5px' }}>Sales Information</h3>

          <div className="row">
            <label>Sales Date</label>
            <span>:</span>
            <input type="date" name="salesDate" value={formData.salesDate} onChange={handleFormChange} />
          </div>

          <div className="row">
            <label>Invoice No</label>
            <span>:</span>
            <input type="text" name="invoiceNo" value={formData.invoiceNo} onChange={handleFormChange} />
          </div>

          <div className="row">
            <label>Customer</label>
            <span>:</span>
            <select name="customerId" value={formData.customerId} onChange={handleFormChange}>
              <option value="">Select Customer</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="row">
            <label>Area</label>
            <span>:</span>
            <select name="areaId" value={formData.areaId} onChange={handleFormChange}>
              <option value="">Select Area</option>
              {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>

          <div className="row">
            <label>Salesman</label>
            <span>:</span>
            <select name="salesmanId" value={formData.salesmanId} onChange={handleFormChange}>
              <option value="">Select Salesman</option>
              {salesmen.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="row">
            <label>Due Date</label>
            <span>:</span>
            <input type="date" name="dueDate" value={formData.dueDate} onChange={handleFormChange} />
          </div>

          {/* Line Items Section */}
          <h3 style={{ color: '#1f3f67', marginTop: '20px', borderBottom: '1px solid #7b8fb3', paddingBottom: '5px' }}>Line Items</h3>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px' }}>
            <thead>
              <tr style={{ background: '#dce8ff' }}>
                <th style={{ border: '1px solid #9db7e8', padding: '5px' }}>Item</th>
                <th style={{ border: '1px solid #9db7e8', padding: '5px' }}>Qty</th>
                <th style={{ border: '1px solid #9db7e8', padding: '5px' }}>Rate</th>
                <th style={{ border: '1px solid #9db7e8', padding: '5px' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ border: '1px solid #9db7e8', padding: '5px' }}>
                    <select 
                      value={item.itemId}
                      onChange={(e) => handleLineItemChange(idx, 'itemId', e.target.value)}
                      style={{ width: '100%' }}
                    >
                      <option value="">Select Item</option>
                      {items.map(it => <option key={it.id} value={it.id}>{it.name}</option>)}
                    </select>
                  </td>
                  <td style={{ border: '1px solid #9db7e8', padding: '5px' }}>
                    <input 
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleLineItemChange(idx, 'quantity', e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </td>
                  <td style={{ border: '1px solid #9db7e8', padding: '5px' }}>
                    <input 
                      type="number"
                      value={item.rate}
                      onChange={(e) => handleLineItemChange(idx, 'rate', e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </td>
                  <td style={{ border: '1px solid #9db7e8', padding: '5px', textAlign: 'right' }}>
                    {item.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Amount Section */}
          <h3 style={{ color: '#1f3f67', borderBottom: '1px solid #7b8fb3', paddingBottom: '5px' }}>Amounts</h3>

          <div className="row">
            <label>Total Amount</label>
            <span>:</span>
            <input type="number" name="totalAmount" value={formData.totalAmount} onChange={handleFormChange} disabled />
          </div>

          <div className="row">
            <label>Tax Amount</label>
            <span>:</span>
            <input type="number" name="taxAmount" value={formData.taxAmount} onChange={handleFormChange} />
          </div>

          <div className="row">
            <label>Discount Amount</label>
            <span>:</span>
            <input type="number" name="discountAmount" value={formData.discountAmount} onChange={handleFormChange} />
          </div>

          <div className="row">
            <label>Net Amount</label>
            <span>:</span>
            <input type="number" name="netAmount" value={formData.netAmount} onChange={handleFormChange} disabled />
          </div>

          <div className="row">
            <label>Remarks</label>
            <span>:</span>
            <input type="text" name="remarks" value={formData.remarks} onChange={handleFormChange} style={{ width: '400px' }} />
          </div>

          {/* SAVE Button */}
          <div className="btn-row">
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalesCreate;
```

---

## Testing Checklist for Converted Components

### Visual Tests
- [ ] Page title visible at top
- [ ] All form fields visible
- [ ] SAVE button visible at bottom
- [ ] No content cut off on left or right
- [ ] No content cut off at top or bottom
- [ ] Scrollbar appears when content exceeds height

### Scrolling Tests
- [ ] Page scrolls down smoothly
- [ ] Page scrolls back up smoothly
- [ ] Scrollbar is styled correctly (blue theme)
- [ ] Sticky headers stay visible (Display pages)

### Functionality Tests (Create)
- [ ] All form fields accept input
- [ ] Dropdown fields work properly
- [ ] Date fields work properly
- [ ] SAVE button is clickable
- [ ] Form validation works (shows error for missing required fields)
- [ ] Success message appears after save
- [ ] Form resets after successful save
- [ ] Data appears in database

### Functionality Tests (Display)
- [ ] All table columns are visible
- [ ] ACTIONS column visible on right
- [ ] UPDATE button is clickable
- [ ] DELETE button is clickable and shows confirmation
- [ ] PRINT button is clickable
- [ ] Modal opens when UPDATE is clicked
- [ ] Modal form fields are populated
- [ ] Modal SAVE button updates database
- [ ] Row counter shows correct number
- [ ] Search/filter works (if implemented)

---

## Common Field Types & Implementation

### Text Input
```jsx
<input type="text" name="fieldName" value={formData.fieldName} onChange={handleChange} />
```

### Date Input
```jsx
<input type="date" name="fieldName" value={formData.fieldName} onChange={handleChange} />
```

### Number Input
```jsx
<input type="number" name="fieldName" value={formData.fieldName} onChange={handleChange} />
```

### Dropdown/Select
```jsx
<select name="fieldName" value={formData.fieldName} onChange={handleChange}>
  <option value="">Select...</option>
  <option value="value1">Label 1</option>
  <option value="value2">Label 2</option>
</select>
```

### Textarea
```jsx
<textarea name="fieldName" value={formData.fieldName} onChange={handleChange} rows="4" />
```

### Radio Buttons
```jsx
<div>
  <label><input type="radio" name="fieldName" value="option1" onChange={handleChange} /> Option 1</label>
  <label><input type="radio" name="fieldName" value="option2" onChange={handleChange} /> Option 2</label>
</div>
```

---

## API Endpoint Patterns

### Create
```javascript
POST http://localhost:5000/api/entry/advance
Body: { date, papadCompany, amount, payMode, remarks, status }
```

### Read All
```javascript
GET http://localhost:5000/api/entry/advance
Response: [ { id, date, papadCompany, ... }, ... ]
```

### Update
```javascript
PUT http://localhost:5000/api/entry/advance/{id}
Body: { date, papadCompany, amount, payMode, remarks, status }
```

### Delete
```javascript
DELETE http://localhost:5000/api/entry/advance/{id}
```

---

## Tips & Best Practices

1. **Always use Templates**: Copy StandardCreatePage.jsx or StandardDisplayPage.jsx
2. **Consistent Naming**: Use camelCase for component names and snake_case for database fields
3. **Always Add Validation**: Check required fields before save
4. **Always Add Error Handling**: Wrap fetch calls in try-catch
5. **Always Test Scrolling**: Ensure pages scroll when content exceeds viewport
6. **Always Test Buttons**: Verify SAVE, UPDATE, DELETE, PRINT work
7. **Always Test Database**: Verify data saves and retrieves correctly
8. **Always Add Loading State**: Show "Saving..." while submitting
9. **Always Add Success Messages**: Show "Saved successfully!" after save
10. **Always Test Responsiveness**: Check on mobile, tablet, desktop

---

**Quick Reference File**: This guide  
**Full Guide**: REACT_CONVERSION_GUIDE.md  
**Status Tracker**: COMPONENT_CONVERSION_CHECKLIST.md  
**Templates**: StandardCreatePage & StandardDisplayPage files

---

**Last Updated**: February 5, 2026  
**Version**: 1.0
