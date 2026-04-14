import React, { useState } from 'react';
import './FlourOutCreation.css';
import api from '../utils/api';

// Import modular entry components
import { EntryTopFrame, EntryItemsTable, EntryTotalsRow, EntryActions, EntrySection } from './entry'

const FlourOutCreation = () => {
  const [formData, setFormData] = useState({
    sNo: '',
    date: new Date().toISOString().split('T')[0],
    papad_company: '',
    remarks: ''
  })

  const [items, setItems] = useState([
    { item_name: '', lot_no: '', weight: 0, qty: 0, total_wt: 0, papad_kg: 0, wages_bag: 0, wages: 0 }
  ])

  const [totals, setTotals] = useState({
    totalQty: 0,
    totalWeight: 0,
    totalWages: 0
  })

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Auto-calculate total weight
    if (field === 'weight' || field === 'qty') {
      const weight = parseFloat(newItems[index].weight) || 0;
      const qty = parseFloat(newItems[index].qty) || 0;
      newItems[index].total_wt = weight * qty;
    }

    // Auto-calculate wages
    if (field === 'papad_kg' || field === 'wages_bag') {
      const papadKg = parseFloat(newItems[index].papad_kg) || 0;
      const wagesBag = parseFloat(newItems[index].wages_bag) || 0;
      newItems[index].wages = papadKg * wagesBag;
    }

    setItems(newItems);
    calculateTotals(newItems);
  }

  const calculateTotals = (currentItems) => {
    let totalQty = 0, totalWeight = 0, totalWages = 0;

    currentItems.forEach(item => {
      totalQty += parseFloat(item.qty) || 0;
      totalWeight += parseFloat(item.total_wt) || 0;
      totalWages += parseFloat(item.wages) || 0;
    });

    setTotals({
      totalQty,
      totalWeight,
      totalWages
    });
  }

  const addItem = () => {
    setItems([...items, { item_name: '', lot_no: '', weight: 0, qty: 0, total_wt: 0, papad_kg: 0, wages_bag: 0, wages: 0 }]);
  }

  const removeItem = (index) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
      calculateTotals(newItems);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.date || !formData.papad_company) {
      setMessage('Date and papad company are required');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Use Tauri API instead of fetch
      const result = await api.createFlourOut(formData, items);

      if (result && result.success) {
        setMessage('Flour out saved successfully!');
        setMessageType('success');
        setFormData({
          sNo: '',
          date: new Date().toISOString().split('T')[0],
          papad_company: '',
          remarks: ''
        });
        setItems([{ item_name: '', lot_no: '', weight: 0, qty: 0, total_wt: 0, papad_kg: 0, wages_bag: 0, wages: 0 }]);
        setTotals({ totalQty: 0, totalWeight: 0, totalWages: 0 });
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(result?.message || 'Error saving flour out');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error saving flour out:', error);
      setMessage('Error saving flour out: ' + error.message);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const topFrameFields = [
    { name: 'sNo', label: 'S.No', value: formData.sNo },
    { name: 'date', label: 'Date', type: 'date', value: formData.date },
    { name: 'papad_company_id', label: 'Papad Company', masterType: 'papad_companies', value: formData.papad_company_id },
    { name: 'remarks', label: 'Remarks', value: formData.remarks },
  ];

  const itemColumns = [
    { key: 'item_name', title: 'Item Name' },
    { key: 'lot_no', title: 'Lot No' },
    { key: 'weight', title: 'Weight', type: 'number' },
    { key: 'qty', title: 'Qty', type: 'number' },
    { key: 'total_wt', title: 'Total Wt', type: 'number' },
    { key: 'papad_kg', title: 'Papad Kg', type: 'number' },
    { key: 'wages_bag', title: 'Wages/Bag', type: 'number' },
    { key: 'wages', title: 'Wages', type: 'number' },
  ];

  const totalsArr = [
    { name: 'totalQty', label: 'Total Qty', value: totals.totalQty.toFixed(2) },
    { name: 'totalWeight', label: 'Total Weight', value: totals.totalWeight.toFixed(2) },
    { name: 'totalWages', label: 'Total Wages', value: totals.totalWages.toFixed(2) },
  ];

  const handleRowChange = (rowIndex, key, value) => {
    handleItemChange(rowIndex, key, value);
  };

  return (
    <div className="window">
      <div className="screen-title">Flour Out Creation</div>

      {message && <div className={`message ${messageType}`}>{message}</div>}

      <EntryTopFrame 
        fields={topFrameFields} 
        data={formData} 
        onChange={handleFormChange}
      />

      <EntrySection title="Items">
        <EntryItemsTable 
          columns={itemColumns}
          data={items}
          onRowChange={handleRowChange}
          onAddRow={addItem}
          onDeleteRow={removeItem}
          showActions={true}
        />
      </EntrySection>

      <EntryTotalsRow totals={totalsArr} />

      <EntryActions 
        onSave={handleSubmit}
        saving={loading}
        saveText="Save"
      />
    </div>
  );
};

export default FlourOutCreation;
