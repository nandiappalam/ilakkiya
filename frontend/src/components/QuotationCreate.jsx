import React, { useState } from 'react';
import './QuotationCreate.css';

// Import modular entry components
import { EntryTopFrame, EntryItemsTable, EntryTotalsRow, EntryBottomSummary, EntryActions } from './entry';

const QuotationCreate = () => {
  const [formData, setFormData] = useState({
    bill_no: '',
    date: new Date().toISOString().split('T')[0],
    pay_type: '',
    tax_type: '',
    type: '',
    remarks: '',
    customer: '',
    address: '',
    tax_percent: '',
    amount: '',
    bill_amt: '',
    tax_amt: '',
    total_amt: '',
    deduction: '',
    percent: '',
    deduction_amount: '',
    deduction_remarks: ''
  });

  const [items, setItems] = useState([
    { id: 1, item_name: '', qty: '', box: '', rate: '', disc: '', tax: '', amount: '' }
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRowChange = (rowIndex, key, value) => {
    setItems(prevItems => {
      const newItems = [...prevItems];
      if (key === '__batch__' && typeof value === 'object') {
        newItems[rowIndex] = { ...newItems[rowIndex], ...value };
      } else {
        newItems[rowIndex] = { ...newItems[rowIndex], [key]: value };
      }
      return newItems;
    });
  };

  const addItemRow = () => {
    const newId = Math.max(...items.map(i => i.id), 0) + 1;
    setItems(prev => [...prev, { id: newId, item_name: '', qty: '', box: '', rate: '', disc: '', tax: '', amount: '' }]);
  };

  const deleteItemRow = (index) => {
    setItems(prev => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, items })
      });
      
      if (response.ok) {
        alert('Quotation saved successfully!');
        setFormData({
          bill_no: '',
          date: new Date().toISOString().split('T')[0],
          pay_type: '',
          tax_type: '',
          type: '',
          remarks: '',
          customer: '',
          address: '',
          tax_percent: '',
          amount: '',
          bill_amt: '',
          tax_amt: '',
          total_amt: '',
          deduction: '',
          percent: '',
          deduction_amount: '',
          deduction_remarks: ''
        });
        setItems([
          { id: 1, item_name: '', qty: '', box: '', rate: '', disc: '', tax: '', amount: '' }
        ]);
      } else {
        alert('Error saving quotation');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const topFrameFields = [
    { name: 'bill_no', label: 'Bill No', type: 'text' },
    { name: 'date', label: 'Date', type: 'date' },
    { name: 'pay_type', label: 'Pay Type', type: 'text' },
    { name: 'tax_type', label: 'Tax Type', type: 'text' },
    { name: 'type', label: 'Type', type: 'text' },
    { name: 'remarks', label: 'Remarks', type: 'text' },
    { name: 'customer_id', label: 'Customer', type: 'masterSelect', masterType: 'customers' },
    { name: 'address', label: 'Address', type: 'text' },
  ];

  const itemColumns = [
    { key: 'item_name', title: 'Item Name', type: 'masterSelect', masterType: 'items' },
    { key: 'lot_no', title: 'Lot No', type: 'lotSelect' },
    { key: 'qty', title: 'Qty', type: 'number' },
    { key: 'box', title: 'Box', type: 'number' },
    { key: 'rate', title: 'Rate', type: 'number' },
    { key: 'disc', title: 'Disc %', type: 'number' },
    { key: 'tax', title: 'Tax %', type: 'number' },
    { key: 'amount', title: 'Amount', type: 'number' }
  ];

  const totals = [
    { name: 'tax_percent', label: 'Tax %', value: formData.tax_percent },
    { name: 'amount', label: 'Amount', value: formData.amount },
    { name: 'bill_amt', label: 'Bill Amt', value: formData.bill_amt },
    { name: 'tax_amt', label: 'Tax Amt', value: formData.tax_amt },
    { name: 'total_amt', label: 'Total Amt', value: formData.total_amt },
  ];

  const summaryFields = [
    { name: 'deduction', label: 'Deduction', value: formData.deduction },
    { name: 'percent', label: 'Percent', value: formData.percent },
    { name: 'deduction_amount', label: 'Amount', value: formData.deduction_amount },
    { name: 'deduction_remarks', label: 'Remarks', value: formData.deduction_remarks },
  ];

  return (
    <div className="window">
      <div className="screen-title">Quotation Creation</div>

      <EntryTopFrame 
        fields={topFrameFields} 
        data={formData} 
        onChange={handleInputChange}
      />

      <EntryItemsTable 
        columns={itemColumns}
        data={items}
        onRowChange={handleRowChange}
        onAddRow={addItemRow}
        onDeleteRow={deleteItemRow}
        showActions={true}
        lotMode="select"
      />

      <EntryTotalsRow totals={totals} />

      <EntryBottomSummary 
        summaryFields={summaryFields}
        formData={formData}
        onChange={handleInputChange}
      />

      <EntryActions 
        onSave={handleSave}
        saveText="Save"
      />
    </div>
  );
};

export default QuotationCreate;
