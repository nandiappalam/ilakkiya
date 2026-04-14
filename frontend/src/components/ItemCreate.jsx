import React, { useState, useEffect } from 'react';
import api, { safeArray } from '../utils/api.js';
import { MASTER_CONFIG, useMasterConfig } from '../utils/masterFields.js';
import MasterFormLayout from './master/MasterFormLayout';
import { FormSection, SmartField } from './master';
import MasterActions from './master/MasterActions';
import './ItemCreate.css';
import './master/master.css';

console.log("ITEM CREATE ACTIVE - CONFIG DRIVEN");

const ItemCreate = () => {
  const config = MASTER_CONFIG.item;
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    // Generate next item code
    api.getMasters(config.table).then((res) => {
      const count = safeArray(res.data).length;
      const nextCode = `ITM${String(count + 1).padStart(3, '0')}`;
      handleChange('item_code', nextCode);
    }).catch(err => console.log('Item code gen failed', err));

    // Init form with defaults
    const initialData = {};
    config.sections.forEach(section => {
      section.fields.forEach(field => {
        if (field.defaultValue !== undefined) {
          initialData[field.name] = field.defaultValue;
        }
      });
    });
    setFormData(initialData);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.item_name?.trim()) {
      setMessage('Item Name is required');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const result = await api.createMaster(config.table, formData);

      if (result.success) {
        setMessage('Item saved successfully!');
        setMessageType('success');
        // Reset form
        const resetData = {};
        config.sections.forEach(section => {
          section.fields.forEach(field => {
            if (field.defaultValue !== undefined) {
              resetData[field.name] = field.defaultValue;
            } else {
              resetData[field.name] = '';
            }
          });
        });
        setFormData(resetData);
        setTimeout(() => setMessage(''), 3000);
      } else {
        console.error('FULL SAVE RESULT:', result);
        setMessage('Error: ' + (result.message || 'Unknown error'));
        setMessageType('error');
      }
    } catch (error) {
      console.error('FULL SAVE ERROR:', error);
      setMessage('Error saving item');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    const resetData = {};
    config.sections.forEach(section => {
      section.fields.forEach(field => {
        if (field.defaultValue !== undefined) {
          resetData[field.name] = field.defaultValue;
        } else {
          resetData[field.name] = '';
        }
      });
    });
    setFormData(resetData);
    setMessage('');
  };

  return (
    <MasterFormLayout title="Item Creation" onSave={handleSubmit} onCancel={handleCancel}>
      {message && <div className={`message ${messageType}`}>{message}</div>}

      {config.sections.map((section, secIndex) => (
        <FormSection key={secIndex} title={section.title}>
          {section.fields.map((field, fieldIndex) => (
            <SmartField 
              key={fieldIndex} 
              field={field} 
              value={formData[field.name]} 
              onChange={handleChange} 
            />
          ))}
        </FormSection>
      ))}

      <MasterActions
        onSave={handleSubmit}
        onCancel={handleCancel}
        showSave={true}
        saving={loading}
        mode="create"
      />
    </MasterFormLayout>
  );
};

export default ItemCreate;
