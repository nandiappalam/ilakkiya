import React, { useState, useEffect } from "react";
import api from "../../utils/api.js";
import { MASTER_FIELD_TYPES, FIELD_TYPES } from "../../utils/masterFields.js";
import "./master.css";

export const SmartField = ({ 
  field, 
  value, 
  onChange, 
  className = "" 
}) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fieldType = field.type || FIELD_TYPES[field.name] || 'text';
  const isMaster = field.masterType || MASTER_FIELD_TYPES[field.name];
  const isReadonly = field.readonly || false;
  const finalValue = value !== undefined ? value : field.defaultValue || '';

  useEffect(() => {
    if (isMaster && !isReadonly) {
      setLoading(true);
      api.getMasters(isMaster)
        .then(res => {
          setOptions(res.data || []);
        })
        .catch(err => console.error(`Failed to load ${isMaster}:`, err))
        .finally(() => setLoading(false));
    }
  }, [isMaster]);

  const handleChange = (e) => {
    onChange(field.name, e.target.value);
  };

  const labelText = field.label || field.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  if (isReadonly) {
    return (
      <div className={`field-group full-span ${className}`}>
        <label className="field-label">
          {labelText} {field.required && <span style={{ color: '#f44336' }}> *</span>}
        </label>
        <div className="uniform-input readonly-field">{finalValue || '-'}</div>
      </div>
    );
  }

  const inputProps = {
    name: field.name,
    value: finalValue,
    onChange: handleChange,
    placeholder: field.placeholder || `Enter ${labelText.toLowerCase()}`,
    className: "uniform-input",
    required: field.required || false,
    disabled: loading,
  };

  return (
    <div className={`field-group ${field.fullWidth ? 'full-span' : ''} ${className}`}>
      <label className="field-label">
        {labelText} {field.required && <span style={{ color: '#f44336' }}> *</span>}
      </label>
      
      {loading ? (
        <div className="uniform-input" style={{ opacity: 0.6 }}>Loading...</div>
      ) : fieldType === 'select' ? (
        <select {...inputProps}>
          <option value="">Select {labelText}</option>
          {options.map(opt => (
            <option key={opt.id || opt.value} value={opt.id || opt.value}>
              {opt.name || opt.label || opt.value}
            </option>
          ))}
        </select>
      ) : fieldType === 'textarea' ? (
        <textarea {...inputProps} rows={3} />
      ) : fieldType === 'number' ? (
        <input type="number" step="0.01" {...inputProps} />
      ) : (
        <input type={fieldType} {...inputProps} />
      )}
    </div>
  );
};

export default SmartField;
