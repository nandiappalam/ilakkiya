import React, { useState } from 'react';
import './OpenCreate.css';
import api from '../utils/api';

// Import modular entry components
import { EntryTopFrame, EntryActions } from './entry'

const OpenCreate = () => {
  const [formData, setFormData] = useState({
    s_no: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    remarks: '',
  })

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setLoading(true);
    setMessage('');

    try {
      // Use Tauri API instead of fetch
      const result = await api.createOpen(formData);

      if (result && result.success) {
        setMessage('Open entry saved successfully!');
        setMessageType('success');
        setFormData({
          s_no: '',
          date: new Date().toISOString().split('T')[0],
          description: '',
          amount: '',
          remarks: '',
        });
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(result?.message || 'Error saving Open entry');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error saving Open entry:', error);
      setMessage('Error saving Open entry: ' + error.message);
      setMessageType('error');
    }
    setLoading(false);
  }

  const topFrameFields = [
    { name: 's_no', label: 'S.No', value: formData.s_no },
    { name: 'date', label: 'Date', type: 'date', value: formData.date },
    { name: 'description', label: 'Description', value: formData.description },
    { name: 'amount', label: 'Amount', value: formData.amount },
    { name: 'remarks', label: 'Remarks', value: formData.remarks },
  ];

  return (
    <div className="window">
      <div className="screen-title">Open Entry Creation</div>

      {message && <div className={`message ${messageType}`}>{message}</div>}

      <EntryTopFrame 
        fields={topFrameFields} 
        data={formData} 
        onChange={handleChange}
      />

      <EntryActions 
        onSave={handleSave}
        saving={loading}
        saveText="Save"
      />
    </div>
  );
};

export default OpenCreate;
