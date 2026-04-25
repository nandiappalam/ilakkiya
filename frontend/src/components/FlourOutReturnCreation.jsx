import React, { useState } from 'react';
import './FlourOutReturnCreation.css';
import api from '../utils/api';

// Import modular entry components
import { EntryTopFrame, EntryItemsTable, EntryTotalsRow, EntryActions, EntrySection } from './entry'

const FlourOutReturnCreation = () => {
  const [formData, setFormData] = useState({
    sno: 1,
    date: '',
    taxType: '',
    remarks: ''
  })

  const [items, setItems] = useState([
    { no: 1, item_name: '', lot_no: '', weight: '', qty: '', total_wt: '', papad_kg: '', cost: '', wages_per_bag: '', wages: '' }
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
    setItems(prevItems => {
      const newItems = [...prevItems];
      if (field === '__batch__' && typeof value === 'object') {
        newItems[index] = { ...newItems[index], ...value };
      } else {
        newItems[index] = { ...newItems[index], [field]: value };
      }

      if (field === 'weight' || field === 'qty' || (field === '__batch__' && ('weight' in value || 'qty' in value))) {
        const weight = parseFloat(newItems[index].weight) || 0;
        const qty = parseFloat(newItems[index].qty) || 0;
        newItems[index].total_wt = (weight * qty).toFixed(2);
      }

      if (field === 'qty' || field === 'wages_per_bag' || (field === '__batch__' && ('qty' in value || 'wages_per_bag' in value))) {
        const qty = parseFloat(newItems[index].qty) || 0;
        const wagesBag = parseFloat(newItems[index].wages_per_bag) || 0;
        newItems[index].wages = (qty * wagesBag).toFixed(2);
      }

      updateTotals(newItems);
      return newItems;
    });
  }

  const updateTotals = (itemsList) => {
    const qty = itemsList.reduce((sum, item) => sum + (parseFloat(item.qty) || 0), 0);
    const weight = itemsList.reduce((sum, item) => sum + (parseFloat(item.total_wt) || 0), 0);
    const wages = itemsList.reduce((sum, item) => sum + (parseFloat(item.wages) || 0), 0);
    setTotals({ totalQty: qty, totalWeight: weight, totalWages: wages });
  }

  const addRow = () => {
    setItems(prev => [...prev, { 
      no: prev.length + 1, 
      item_name: '', 
      lot_no: '', 
      weight: '', 
      qty: '', 
      total_wt: '', 
      papad_kg: '', 
      cost: '', 
      wages_per_bag: '', 
      wages: '' 
    }]);
  }

  const deleteRow = (index) => {
    setItems(prev => {
      if (prev.length <= 1) return prev;
      const newItems = prev.filter((_, i) => i !== index);
      updateTotals(newItems);
      return newItems;
    });
  }

  const handleSave = async () => {
    setLoading(true);
    setMessage('');

    try {
      const data = {
        ...formData,
        items,
        totalQty: totals.totalQty,
        totalWeight: totals.totalWeight,
        totalWages: totals.totalWages
      };

      const result = await api.createFlourOutReturn(data);

      if (result && result.success) {
        setMessage('Flour out return saved successfully!');
        setMessageType('success');
        setFormData({ sno: 1, date: '', taxType: '', remarks: '' });
        setItems([{ no: 1, item_name: '', lot_no: '', weight: '', qty: '', total_wt: '', papad_kg: '', cost: '', wages_per_bag: '', wages: '' }]);
        setTotals({ totalQty: 0, totalWeight: 0, totalWages: 0 });
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(result?.message || 'Error saving flour out return');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error saving flour out return:', error);
      setMessage('Error saving flour out return: ' + error.message);
      setMessageType('error');
    }
    setLoading(false);
  };

  const topFrameFields = [
    { name: 'sno', label: 'S.No', value: formData.sno },
    { name: 'date', label: 'Date', type: 'date', value: formData.date },
    { name: 'taxType', label: 'Tax Type', value: formData.taxType },
    { name: 'remarks', label: 'Remarks', value: formData.remarks },
  ];

  const itemColumns = [
    { key: 'item_name', title: 'Item Name', type: 'masterSelect', masterType: 'items' },
    { key: 'lot_no', title: 'Lot No', type: 'lotSelect' },
    { key: 'weight', title: 'Weight', type: 'number' },
    { key: 'qty', title: 'Qty', type: 'number' },
    { key: 'total_wt', title: 'Total Wt', readOnly: true },
    { key: 'papad_kg', title: 'Papad Kg', type: 'number' },
    { key: 'cost', title: 'Cost', type: 'number' },
    { key: 'wages_per_bag', title: 'Wages/Bag', type: 'number' },
    { key: 'wages', title: 'Wages', readOnly: true },
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
      <div className="screen-title">Flour Out Return Creation</div>

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
          onAddRow={addRow}
          onDeleteRow={deleteRow}
          showActions={true}
          lotMode="select"
        />
      </EntrySection>

      <EntryTotalsRow totals={totalsArr} />

      <EntryActions 
        onSave={handleSave}
        saving={loading}
        saveText="Save"
      />
    </div>
  );
};

export default FlourOutReturnCreation;
