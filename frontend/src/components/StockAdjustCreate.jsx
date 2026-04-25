import React, { useState } from 'react';
import './StockAdjustCreate.css';

// Import modular entry components
import { EntryTopFrame, EntryItemsTable, EntryActions, EntrySection } from './entry'

const StockAdjustCreate = () => {
  const [formData, setFormData] = useState({
    sNo: '',
    type: '',
    papadComp: '',
    date: '',
    flourMill: '',
    remarks: ''
  });

  const [items, setItems] = useState([
    { sNo: '', item_name: '', lot_no: '', weight: '', type: '', qty: '', totWt: '', rate: '', remarks: '' }
  ]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleItemChange = (index, field, value) => {
    setItems(prevItems => {
      const newItems = [...prevItems];
      if (field === '__batch__' && typeof value === 'object') {
        newItems[index] = { ...newItems[index], ...value };
      } else {
        newItems[index] = { ...newItems[index], [field]: value };
      }
      return newItems;
    });
  };

  const addItemRow = () => {
    setItems(prev => [...prev, { sNo: '', item_name: '', lot_no: '', weight: '', type: '', qty: '', totWt: '', rate: '', remarks: '' }]);
  };

  const removeItemRow = (index) => {
    setItems(prev => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      setMessage('Stock Adjust saved successfully!');
      setMessageType('success');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error saving stock adjust');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const topFrameFields = [
    { name: 'sNo', label: 'S.No', value: formData.sNo },
    { name: 'type', label: 'Type', value: formData.type },
    { name: 'papadComp', label: 'Papad Comp', value: formData.papadComp },
    { name: 'date', label: 'Date', type: 'date', value: formData.date },
    { name: 'flourMill', label: 'Flour Mill', value: formData.flourMill },
    { name: 'remarks', label: 'Remarks', value: formData.remarks },
  ];

  const itemColumns = [
    { key: 'sNo', title: 'S.No' },
    { key: 'item_name', title: 'Item Name', type: 'masterSelect', masterType: 'items' },
    { key: 'lot_no', title: 'Lot No', type: 'lotSelect' },
    { key: 'weight', title: 'Weight', type: 'number' },
    { key: 'type', title: 'Type' },
    { key: 'qty', title: 'Qty', type: 'number' },
    { key: 'totWt', title: 'Tot Wt', type: 'number' },
    { key: 'rate', title: 'Rate', type: 'number' },
    { key: 'remarks', title: 'Remarks' },
  ];

  const handleRowChange = (rowIndex, key, value) => {
    handleItemChange(rowIndex, key, value);
  };

  return (
    <div className="window">
      <div className="screen-title">Stock Adjust Creation</div>

      {message && <div className={`message ${messageType}`}>{message}</div>}

      <EntryTopFrame 
        fields={topFrameFields} 
        data={formData} 
        onChange={handleChange}
      />

      <EntrySection title="Items">
        <EntryItemsTable 
          columns={itemColumns}
          data={items}
          onRowChange={handleRowChange}
          onAddRow={addItemRow}
          onDeleteRow={removeItemRow}
          showActions={true}
          lotMode="select"
        />
      </EntrySection>

      <EntryActions 
        onSave={handleSubmit}
        saving={loading}
        saveText="Save"
      />
    </div>
  );
};

export default StockAdjustCreate;
