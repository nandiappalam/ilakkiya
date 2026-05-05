import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SmartField from '../../components/master/SmartField';
import { safeArray } from '../../utils/safeArray.js';
import './VehicleCreate.css';

const VehicleCreate = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  // Field names use snake_case to match backend SQL column names
  const config = {
    sections: [
      {
        title: 'Vehicle Details',
        fields: [
          { name: 'reference_type', label: 'Reference Type', type: 'select', options: [
            { value: 'PURCHASE', label: 'Purchase' },
            { value: 'SALES', label: 'Sales' },
            { value: 'PURCHASE_RETURN', label: 'Purchase Return' },
            { value: 'SALES_RETURN', label: 'Sales Return' }
          ]},
          { name: 'reference_id', label: 'Reference ID', type: 'number' },
          { name: 'vehicle_no', label: 'Vehicle No *', type: 'text', required: true },
          { name: 'driver_name', label: 'Driver Name', type: 'text' },
          { name: 'transporter_id', label: 'Transporter', type: 'masterSelect', masterType: 'transports' },
          { name: 'status', label: 'Status', type: 'select', options: [
            { value: 'IN', label: 'IN' },
            { value: 'LOADED', label: 'LOADED' },
            { value: 'UNLOADED', label: 'UNLOADED' },
            { value: 'OUT', label: 'OUT' }
          ]}
        ]
      },
      {
        title: 'Weights',
        fields: [
          { name: 'gross_weight', label: 'Gross Weight', type: 'number' },
          { name: 'tare_weight', label: 'Tare Weight', type: 'number' },
          { name: 'net_weight', label: 'Net Weight', type: 'number', readOnly: true }
        ]
      },
      {
        title: 'Gate Times',
        fields: [
          { name: 'gate_in_time', label: 'Gate In Time', type: 'datetime-local' },
          { name: 'gate_out_time', label: 'Gate Out Time', type: 'datetime-local' }
        ]
      }
    ]
  };

  const sections = safeArray(config.sections);

  const getResetData = () => {
    const resetData = {};
    sections.forEach(section => {
      safeArray(section.fields).forEach(field => {
        resetData[field.name] = '';
      });
    });
    return resetData;
  };

  useEffect(() => {
    setFormData(getResetData());
  }, []);

const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!formData.vehicle_no?.trim()) {
      setMessage('Vehicle No is required');
      setMessageType('error');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setMessage('');

    const payload = formData;

    try {
      const response = await fetch('/api/vehicle-movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success) {
        setMessage('Vehicle Movement saved successfully!');
        setMessageType('success');
        setFormData(getResetData());
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Error: ' + (result.message || 'Unknown error'));
        setMessageType('error');
      }
    } catch (error) {
      console.error('Save error:', error);
      setMessage('Error saving vehicle movement');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(getResetData());
    setMessage('');
    navigate(-1);
  };

  return (
    <div className="vehicle-create-page">
      {/* Header */}
      <div className="vehicle-header">
        <h2>Vehicle Movement Creation</h2>
        <div className="vehicle-nav">
          <button className="btn-nav" onClick={() => navigate('/entry/vehicle-movement-display')}>
            Go To Vehicle Movement List
          </button>
          <button className="btn-nav" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>
      </div>

{message && <div className={`message ${messageType}`}>{message}</div>}

      <form onSubmit={handleSubmit} className="vehicle-form-container">
        {/* Left Panel - Vehicle Details */}
        <div className="vehicle-left-panel">
          <div className="panel-title">Vehicle Details</div>
          <div className="section-fields">
            {sections[0].fields.map((field, index) => (
              <SmartField
                key={index}
                field={field}
                value={formData[field.name]}
                onChange={handleChange}
              />
            ))}
          </div>
        </div>

        {/* Right Panel - Weights & Times */}
        <div className="vehicle-right-panel">
          <div className="panel-title">Weights & Times</div>
          <div className="section-fields">
            {sections[1].fields.concat(sections[2].fields).map((field, index) => (
              <SmartField
                key={index}
                field={field}
                value={formData[field.name]}
                onChange={handleChange}
              />
            ))}
          </div>
        </div>

        {/* Footer Actions - MOVED INSIDE the form element */}
        <div className="vehicle-footer-actions">
          <button type="button" className="btn-cancel" onClick={handleCancel}>
            Cancel
          </button>
          <button type="submit" className="btn-save" disabled={loading}>
            {loading ? 'Saving...' : 'Save Vehicle Movement'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VehicleCreate;

