import React, { useState } from 'react';
import './PackingCreate.css';

// Import modular entry components
import { EntryTopFrame, EntryItemsTable, EntryActions, EntrySection } from './entry'

const PackingCreate = () => {
  const [formData, setFormData] = useState({
    sNo: '',
    date: '',
    remarks: ''
  });

  const [packingFrom, setPackingFrom] = useState([
    { itemName: '', lotNo: '', kg: '' }
  ]);

  const [packingMaterial, setPackingMaterial] = useState([
    { itemName: '', lotNo: '', qty: '' }
  ]);

  const [packingTo, setPackingTo] = useState([
    { lotNo: '', itemName: '', box: '' }
  ]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePackingFromChange = (index, field, value) => {
    const updated = [...packingFrom];
    updated[index][field] = value;
    setPackingFrom(updated);
  };

  const handlePackingMaterialChange = (index, field, value) => {
    const updated = [...packingMaterial];
    updated[index][field] = value;
    setPackingMaterial(updated);
  };

  const handlePackingToChange = (index, field, value) => {
    const updated = [...packingTo];
    updated[index][field] = value;
    setPackingTo(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // API call would go here
      setMessage('Packing saved successfully!');
      setMessageType('success');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error saving packing');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const topFrameFields = [
    { name: 'sNo', label: 'S.No', value: formData.sNo },
    { name: 'date', label: 'Date', type: 'date', value: formData.date },
    { name: 'remarks', label: 'Remarks', value: formData.remarks },
  ];

  const fromColumns = [
    { key: 'itemName', title: 'Item Name' },
    { key: 'lotNo', title: 'Lot No' },
    { key: 'kg', title: 'Kg' },
  ];

  const materialColumns = [
    { key: 'itemName', title: 'Item Name' },
    { key: 'lotNo', title: 'Lot No' },
    { key: 'qty', title: 'Qty' },
  ];

  const toColumns = [
    { key: 'lotNo', title: 'Lot No' },
    { key: 'itemName', title: 'Item Name' },
    { key: 'box', title: 'Box' },
  ];

  const handleFromRowChange = (rowIndex, key, value) => {
    handlePackingFromChange(rowIndex, key, value);
  };

  const handleMaterialRowChange = (rowIndex, key, value) => {
    handlePackingMaterialChange(rowIndex, key, value);
  };

  const handleToRowChange = (rowIndex, key, value) => {
    handlePackingToChange(rowIndex, key, value);
  };

  return (
    <div className="window">
      <div className="screen-title">Packing Create</div>

      {message && <div className={`message ${messageType}`}>{message}</div>}

      <EntryTopFrame 
        fields={topFrameFields} 
        data={formData} 
        onChange={handleChange}
      />

      <EntrySection title="Packing From">
        <EntryItemsTable 
          columns={fromColumns}
          data={packingFrom}
          onRowChange={handleFromRowChange}
          onAddRow={() => setPackingFrom([...packingFrom, { itemName: '', lotNo: '', kg: '' }])}
          onDeleteRow={(index) => setPackingFrom(packingFrom.filter((_, i) => i !== index))}
          showActions={true}
        />
      </EntrySection>

      <EntrySection title="Packing Material">
        <EntryItemsTable 
          columns={materialColumns}
          data={packingMaterial}
          onRowChange={handleMaterialRowChange}
          onAddRow={() => setPackingMaterial([...packingMaterial, { itemName: '', lotNo: '', qty: '' }])}
          onDeleteRow={(index) => setPackingMaterial(packingMaterial.filter((_, i) => i !== index))}
          showActions={true}
        />
      </EntrySection>

      <EntrySection title="Packing To">
        <EntryItemsTable 
          columns={toColumns}
          data={packingTo}
          onRowChange={handleToRowChange}
          onAddRow={() => setPackingTo([...packingTo, { lotNo: '', itemName: '', box: '' }])}
          onDeleteRow={(index) => setPackingTo(packingTo.filter((_, i) => i !== index))}
          showActions={true}
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

export default PackingCreate;
