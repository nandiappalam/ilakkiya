import React, { useState, useEffect } from 'react';
import './GrainsCreation.css';
import api from '../services/api.js';

// Import modular entry components
import { EntryTopFrame, EntryItemsTable, EntryActions, EntrySection } from './entry'

const GrainsCreation = () => {
  const today = new Date().toISOString().split('T')[0];
  
  const [formData, setFormData] = useState({
    s_no: '1',
    flour_mill: '',
    date: today,
    remarks: ''
  });

  const [inputItems, setInputItems] = useState([
    { item_name: '', lot_no: '', weight: '', qty: '', total_wt: 0, wages_kg: '', total_wages: 0 }
  ]);

  const [outputItems, setOutputItems] = useState([
    { item_name: '', lot_no: '', weight: '', qty: '', total_wt: 0 }
  ]);

  // nextLot state removed - use EntryItemsTable lotMode="auto"


  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  // Lot generation handled by EntryItemsTable lotMode="auto"


  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleInputItemChange = (index, field, value) => {
    const newItems = [...inputItems];
    newItems[index] = { ...newItems[index], [field]: value };

    // Recalculate totals
    const weightVal = parseFloat(newItems[index].weight) || 0;
    const qtyVal = parseFloat(newItems[index].qty) || 0;
    newItems[index].total_wt = weightVal * qtyVal;

    const wagesKgVal = parseFloat(newItems[index].wages_kg) || 0;
    newItems[index].total_wages = newItems[index].total_wt * wagesKgVal;

    setInputItems(newItems);
  };

  const handleOutputItemChange = (index, field, value) => {
    const newItems = [...outputItems];
    newItems[index] = { ...newItems[index], [field]: value };

    // Recalculate total_wt
    const weightVal = parseFloat(newItems[index].weight) || 0;
    const qtyVal = parseFloat(newItems[index].qty) || 0;
    newItems[index].total_wt = weightVal * qtyVal;

    setOutputItems(newItems);
  };

  const addInputItem = () => {
    setInputItems([
      ...inputItems,
      { item_name: '', lot_no: '', weight: '', qty: '', total_wt: 0, wages_kg: '', total_wages: 0 }
    ]);
  };

  const addOutputItem = () => {
    setOutputItems([
      ...outputItems,
      { item_name: '', lot_no: '', weight: '', qty: '', total_wt: 0 }
    ]);
  };

  const deleteInputItem = (index) => {
    if (inputItems.length > 1) {
      setInputItems(inputItems.filter((_, i) => i !== index));
    }
  };

  const deleteOutputItem = (index) => {
    if (outputItems.length > 1) {
      setOutputItems(outputItems.filter((_, i) => i !== index));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');

    try {
      const data = { 
        ...formData, 
        input_items: inputItems, 
        output_items: outputItems 
      };
      const result = await api('entries/grain', { method: 'POST', body: data });

      if (result && result.success) {
        setMessage('Grind creation saved successfully!');
        setMessageType('success');
        // Reset form
        setFormData({ s_no: '1', flour_mill: '', date: today, remarks: '' });
        setInputItems([{ item_name: '', lot_no: '', weight: '', qty: '', total_wt: 0, wages_kg: '', total_wages: 0 }]);
        setOutputItems([{ item_name: '', lot_no: '', weight: '', qty: '', total_wt: 0 }]);
        // nextLot removed
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(result?.message || 'Error saving grind creation');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error saving grind:', error);
      setMessage('Error saving grind creation: ' + error.message);
      setMessageType('error');
    }
    setLoading(false);
  };

  // Top frame fields - S.No now handled globally by EntryTopFrame
  const topFrameFields = [
    { name: 'flour_mill', label: 'Flour Mill', type: 'masterSelect', masterType: 'flour_mills' },
    { name: 'date', label: 'Date', type: 'date', value: formData.date },
    { name: 'remarks', label: 'Remarks', type: 'text', value: formData.remarks }
  ];

  // Input columns
  const inputColumns = [
    { key: 'item_name', title: 'Item Name', type: 'masterSelect', masterType: 'items' },
    { key: 'lot_no', title: 'Lot No', type: 'lotSelect' },
    { key: 'weight', title: 'Weight', type: 'number' },
    { key: 'qty', title: 'Qty', type: 'number' },
    { key: 'total_wt', title: 'Total Wt', readOnly: true },
    { key: 'wages_kg', title: 'Wages/Kg', type: 'number' },
    { key: 'total_wages', title: 'Total Wages', readOnly: true }
  ];

  // Output columns
  const outputColumns = [
    { key: 'item_name', title: 'Output Item', type: 'masterSelect', masterType: 'items' },
    { key: 'lot_no', title: 'Lot No', type: 'text', readOnly: true },
    { key: 'weight', title: 'Weight', type: 'number' },
    { key: 'qty', title: 'Qty', type: 'number' },
    { key: 'total_wt', title: 'Total Wt', readOnly: true }
  ];

  const handleInputRowChange = (rowIndex, key, value) => {
    handleInputItemChange(rowIndex, key, value);
  };

  const handleOutputRowChange = (rowIndex, key, value) => {
    handleOutputItemChange(rowIndex, key, value);
  };

  const addInputRow = (newRow = {}) => {
    setInputItems(prev => [...prev, newRow]);
  };

  const addOutputRow = (newRow = {}) => {
    setOutputItems(prev => [...prev, newRow]);
  };

  const deleteInputRow = (index) => {
    if (inputItems.length > 1) {
      setInputItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  const deleteOutputRow = (index) => {
    if (outputItems.length > 1) {
      setOutputItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="window">
      <div className="screen-title">Grind Creation</div>

      {message && <div className={`message ${messageType}`}>{message}</div>}

      <EntryTopFrame 
        fields={topFrameFields} 
        data={formData} 
        onChange={handleFormChange}
      />

      <EntrySection title="Input Items">
        <EntryItemsTable 
          columns={inputColumns}
          data={inputItems}
          onRowChange={handleInputRowChange}
          onAddRow={addInputRow}
          onDeleteRow={deleteInputRow}
          showActions={true}
          lotMode="select"
        />
      </EntrySection>

      <EntrySection title="Output Items">
        <EntryItemsTable 
          columns={outputColumns}
          data={outputItems}
          onRowChange={handleOutputRowChange}
          onAddRow={addOutputRow}
          onDeleteRow={deleteOutputRow}
          showActions={true}
          lotMode="auto"
        />
      </EntrySection>

      <EntryActions 
        onSave={handleSave}
        saving={loading}
        saveText="Save"
      />
    </div>
  );
};

export default GrainsCreation;

