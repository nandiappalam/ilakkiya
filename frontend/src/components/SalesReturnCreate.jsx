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

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleItemChange = (index, field, value) => {
    setItems(prevItems => {
      const updatedItems = [...prevItems]
      if (field === '__batch__' && typeof value === 'object') {
        updatedItems[index] = { ...updatedItems[index], ...value }
      } else {
        updatedItems[index] = { ...updatedItems[index], [field]: value }
      }
      
      if (field === 'qty' || field === 'rate' || field === 'disc_perc' || field === 'tax_perc' || (field === '__batch__' && ('qty' in value || 'rate' in value || 'disc_perc' in value || 'tax_perc' in value))) {
        const qty = parseFloat(updatedItems[index].qty) || 0
        const rate = parseFloat(updatedItems[index].rate) || 0
        const discPerc = parseFloat(updatedItems[index].disc_perc) || 0
        const taxPerc = parseFloat(updatedItems[index].tax_perc) || 0
        const discAmount = (qty * rate * discPerc) / 100
        const taxableAmount = qty * rate - discAmount
        const taxAmount = (taxableAmount * taxPerc) / 100
        updatedItems[index].amount = taxableAmount + taxAmount
      }
      
      return updatedItems
    })
  }

  const calculateTotals = (currentItems) => {
    const totalQty = currentItems.reduce((sum, item) => sum + (parseFloat(item.qty) || 0), 0)
    const totalWt = currentItems.reduce((sum, item) => sum + (parseFloat(item.qty) || 0), 0)
    const totalAmt = currentItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
    setFormData(prev => ({ ...prev, total_qty: totalQty, total_wt: totalWt, total_amt: totalAmt }))
  }

  const addItem = () => {
    setItems(prev => [...prev, {
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
    setItems(prev => {
      if (prev.length <= 1) return prev
      return prev.filter((_, i) => i !== index)
    })
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
    { name: 'customer_id', label: 'Customer', type: 'masterSelect', masterType: 'customers' },
    { name: 'pay_type', label: 'Pay Type', type: 'select', options: [{value:'Cash', label:'Cash'},{value:'Credit', label:'Credit'}] },
    { name: 'tax_type', label: 'Tax Type', type: 'select', options: [{value:'Exclusive', label:'Exclusive'},{value:'Inclusive', label:'Inclusive'}] },
    { name: 'address', label: 'Address', value: formData.address },
  ];

  const itemColumns = [
    { key: 'item_name', title: 'Item Name', type: 'masterSelect', masterType: 'items' },
    { key: 'lot_no', title: 'Lot No', type: 'lotSelect' },
    { key: 'qty', title: 'Qty', type: 'number' },
    { key: 'box', title: 'Box', type: 'number' },
    { key: 'rate', title: 'Rate', type: 'number' },
    { key: 'disc_perc', title: 'Disc %', type: 'number' },
    { key: 'tax_perc', title: 'Tax %', type: 'number' },
    { key: 'amount', title: 'Amount', readOnly: true },
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
        lotMode="select"
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
