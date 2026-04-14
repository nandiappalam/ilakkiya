import React, { useState } from 'react';
import './SalesReturnCreate.css';

// Import modular entry components
import { EntryTopFrame, EntryItemsTable, EntryTotalsRow, EntryBottomSummary, EntryActions } from './entry'

const SalesReturnCreate = () => {
  const [formData, setFormData] = useState({
    s_no: '',
    date: new Date().toISOString().split('T')[0],
    customer: '',
    pay_type: 'Credit',
    tax_type: 'Exclusive',
    address: '',
    remarks: '',
    total_qty: 0,
    total_wt: 0,
    total_amt: 0,
  })

  const [items, setItems] = useState([
    {
      item_name: '',
      lot_no: '',
      qty: '',
      box: '',
      rate: '',
      disc_perc: '',
      tax_perc: '',
      amount: '',
    },
  ])

  const [taxData, setTaxData] = useState({
    tax_perc: 0,
    amount: 0,
    bill_amt: 0,
    tax_amt: 0,
    total_amt: 0,
  })

  const [deductions, setDeductions] = useState([
    {
      deduction: '',
      percent: 0,
      amount: 0,
      remarks: '',
    },
  ])

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items]
    updatedItems[index][field] = value
    
    if (field === 'qty' || field === 'rate' || field === 'disc_perc' || field === 'tax_perc') {
      const qty = parseFloat(updatedItems[index].qty) || 0
      const rate = parseFloat(updatedItems[index].rate) || 0
      const discPerc = parseFloat(updatedItems[index].disc_perc) || 0
      const taxPerc = parseFloat(updatedItems[index].tax_perc) || 0
      const discAmount = (qty * rate * discPerc) / 100
      const taxableAmount = qty * rate - discAmount
      const taxAmount = (taxableAmount * taxPerc) / 100
      updatedItems[index].amount = taxableAmount + taxAmount
    }
    
    setItems(updatedItems)
    calculateTotals(updatedItems)
  }

  const calculateTotals = (currentItems) => {
    const totalQty = currentItems.reduce((sum, item) => sum + (parseFloat(item.qty) || 0), 0)
    const totalWt = currentItems.reduce((sum, item) => sum + (parseFloat(item.qty) || 0), 0)
    const totalAmt = currentItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
    setFormData(prev => ({ ...prev, total_qty: totalQty, total_wt: totalWt, total_amt: totalAmt }))
  }

  const addItem = () => {
    setItems([...items, {
      item_name: '',
      lot_no: '',
      qty: '',
      box: '',
      rate: '',
      disc_perc: '',
      tax_perc: '',
      amount: '',
    }])
  }

  const removeItem = (index) => {
    const updatedItems = items.filter((_, i) => i !== index)
    setItems(updatedItems)
    calculateTotals(updatedItems)
  }

  const handleSave = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/sales-returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, items }),
      });
      
      if (response.ok) {
        setMessage('Sales Return saved successfully!');
        setMessageType('success');
        setFormData({
          s_no: '',
          date: new Date().toISOString().split('T')[0],
          customer: '',
          pay_type: 'Credit',
          tax_type: 'Exclusive',
          address: '',
          remarks: '',
          total_qty: 0,
          total_wt: 0,
          total_amt: 0,
        });
        setItems([{
          item_name: '',
          lot_no: '',
          qty: '',
          box: '',
          rate: '',
          disc_perc: '',
          tax_perc: '',
          amount: '',
        }]);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Error saving Sales Return');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Error saving Sales Return');
      setMessageType('error');
    }
    setLoading(false);
  }

  const topFrameFields = [
    { name: 's_no', label: 'Bill No', value: formData.s_no },
    { name: 'date', label: 'Date', type: 'date', value: formData.date },
    { name: 'customer', label: 'Customer', value: formData.customer },
    { name: 'pay_type', label: 'Pay Type', value: formData.pay_type },
    { name: 'tax_type', label: 'Tax Type', value: formData.tax_type },
    { name: 'address', label: 'Address', value: formData.address },
  ];

  const itemColumns = [
    { key: 'item_name', title: 'Item Name' },
    { key: 'lot_no', title: 'Lot No' },
    { key: 'qty', title: 'Qty', type: 'number' },
    { key: 'box', title: 'Box', type: 'number' },
    { key: 'rate', title: 'Rate', type: 'number' },
    { key: 'disc_perc', title: 'Disc %', type: 'number' },
    { key: 'tax_perc', title: 'Tax %', type: 'number' },
    { key: 'amount', title: 'Amount', type: 'number' },
  ];

  const totals = [
    { name: 'total_qty', label: 'Total Qty', value: formData.total_qty },
    { name: 'total_wt', label: 'Total Wt', value: formData.total_wt },
    { name: 'total_amt', label: 'Total Amt', value: formData.total_amt },
  ];

  const summaryFields = [
    { name: 'tax_perc', label: 'Tax %', value: taxData.tax_perc },
    { name: 'bill_amt', label: 'Bill Amt', value: taxData.bill_amt },
    { name: 'tax_amt', label: 'Tax Amt', value: taxData.tax_amt },
    { name: 'total_amt', label: 'Total Amt', value: taxData.total_amt },
  ];

  return (
    <div className="window">
      <div className="screen-title">Sales Return Creation</div>

      {message && <div className={`message ${messageType}`}>{message}</div>}

      <EntryTopFrame 
        fields={topFrameFields} 
        data={formData} 
        onChange={handleFormChange}
      />

      <EntryItemsTable 
        columns={itemColumns}
        data={items}
        onRowChange={handleItemChange}
        onAddRow={addItem}
        onDeleteRow={removeItem}
        showActions={true}
      />

      <EntryTotalsRow totals={totals} />

      <EntryBottomSummary 
        summaryFields={summaryFields}
        formData={taxData}
        onChange={(e) => setTaxData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
      />

      <EntryActions 
        onSave={handleSave}
        saving={loading}
        saveText="Save"
      />
    </div>
  );
};

export default SalesReturnCreate;
