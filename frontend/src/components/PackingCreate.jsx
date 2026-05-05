import React, { useState, useCallback, useEffect } from 'react';
import './PackingCreate.css';

// Import modular entry components
import { EntryTopFrame, EntryItemsTable, EntryActions, EntrySection } from './entry'

const PackingCreate = () => {
  const [formData, setFormData] = useState({
    sno: '',
    date: new Date().toISOString().split('T')[0],
    remarks: ''
  });

  // Auto-generate S.No on mount
  useEffect(() => {
    // Generate a simple auto number (in real app this would come from API)
    const autoSno = '1';
    setFormData(prev => ({ ...prev, sno: autoSno }));
  }, []);

  // Packing From: item dropdown → available lots
  const [packingFrom, setPackingFrom] = useState([
    { item_name: '', item_id: '', lot_no: '', kg: '' }
  ]);

  // Packing Material: item dropdown → available lots
  const [packingMaterial, setPackingMaterial] = useState([
    { item_name: '', item_id: '', lot_no: '', qty: '' }
  ]);

  // Packing To: item first, lot auto-generated
  const [packingTo, setPackingTo] = useState([
    { item_name: '', item_id: '', lot_no: '', box: '', qty: '' }
  ]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

// Handle changes from EntryTopFrame (accepts either event or name/value)
  const handleChange = (nameOrEvent, value) => {
    if (typeof nameOrEvent === 'object' && nameOrEvent.target) {
      // It's an event object
      setFormData(prev => ({
        ...prev,
        [nameOrEvent.target.name]: nameOrEvent.target.value
      }));
    } else {
      // It's name/value from EntryTopFrame
      setFormData(prev => ({
        ...prev,
        [nameOrEvent]: value
      }));
    }
  };

  // ✅ Functional state updates to prevent race conditions
  const handlePackingFromChange = useCallback((index, field, value) => {
    setPackingFrom(prev => {
      const updated = [...prev];
      if (field === '__batch__' && typeof value === 'object') {
        updated[index] = { ...updated[index], ...value };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  }, []);

  const handlePackingMaterialChange = useCallback((index, field, value) => {
    setPackingMaterial(prev => {
      const updated = [...prev];
      if (field === '__batch__' && typeof value === 'object') {
        updated[index] = { ...updated[index], ...value };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  }, []);

  const handlePackingToChange = useCallback((index, field, value) => {
    setPackingTo(prev => {
      const updated = [...prev];
      if (field === '__batch__' && typeof value === 'object') {
        updated[index] = { ...updated[index], ...value };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  }, []);

const topFrameFields = [
    { name: 'sno', label: 'S.No', type: 'auto', readOnly: true },
    { name: 'date', label: 'Date', type: 'date' },
    { name: 'remarks', label: 'Remarks', type: 'text' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // TODO: Replace with actual API call
      // const payload = {
      //   header: formData,
      //   packing_from: packingFrom,
      //   packing_material: packingMaterial,
      //   packing_to: packingTo
      // };
      // const result = await api('/packing', 'POST', payload);

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

  // ✅ Packing From columns: item_name dropdown → lot select
  const fromColumns = [
    { key: 'item_name', title: 'Item Name', type: 'masterSelect', masterType: 'items' },
    { key: 'lot_no', title: 'Lot No' },
    { key: 'kg', title: 'Kg', type: 'number' },
  ];

  // ✅ Packing Material columns: item_name dropdown → lot select
  const materialColumns = [
    { key: 'item_name', title: 'Item Name', type: 'masterSelect', masterType: 'items' },
    { key: 'lot_no', title: 'Lot No' },
    { key: 'qty', title: 'Qty', type: 'number' },
  ];

  // ✅ Packing To columns: item_name FIRST, lot_no auto-generated
  const toColumns = [
    { key: 'item_name', title: 'Item Name', type: 'masterSelect', masterType: 'items' },
    { key: 'lot_no', title: 'Lot No' },
    { key: 'box', title: 'Box', type: 'number' },
    { key: 'qty', title: 'Qty', type: 'number' },
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

      <form onSubmit={handleSubmit}>
        {message && <div className={`message ${messageType}`}>{message}</div>}

        <EntryTopFrame 
          fields={topFrameFields} 
          data={formData} 
          onChange={handleChange} 
        />

        {/* Packing From: Item dropdown + Available lots */}
        <EntrySection title="Packing From">
          <EntryItemsTable 
            columns={fromColumns}
            data={packingFrom}
            onRowChange={handleFromRowChange}
            onAddRow={() => setPackingFrom(prev => [...prev, { item_name: '', item_id: '', lot_no: '', kg: '' }])}
            onDeleteRow={(index) => setPackingFrom(prev => prev.filter((_, i) => i !== index))}
            showActions={true}
            lotMode="select"
          />
        </EntrySection>

      {/* Packing Material: Item dropdown + Available lots */}
      <EntrySection title="Packing Material">
        <EntryItemsTable 
          columns={materialColumns}
          data={packingMaterial}
          onRowChange={handleMaterialRowChange}
          onAddRow={() => setPackingMaterial(prev => [...prev, { item_name: '', item_id: '', lot_no: '', qty: '' }])}
          onDeleteRow={(index) => setPackingMaterial(prev => prev.filter((_, i) => i !== index))}
          showActions={true}
          lotMode="select"
        />
      </EntrySection>

      {/* Packing To: Item first, Lot auto-generated */}
      <EntrySection title="Packing To">
        <EntryItemsTable 
          columns={toColumns}
          data={packingTo}
          onRowChange={handleToRowChange}
          onAddRow={() => setPackingTo(prev => [...prev, { item_name: '', item_id: '', lot_no: '', box: '', qty: '' }])}
          onDeleteRow={(index) => setPackingTo(prev => prev.filter((_, i) => i !== index))}
          showActions={true}
          lotMode="auto"
        />
      </EntrySection>

        <EntryActions 
          onSave={handleSubmit}
          saving={loading}
          saveText="Save Packing"
        />
      </form>
    </div>
  );
};

export default PackingCreate;

