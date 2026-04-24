import React, { useState, useEffect } from "react";
import { getMasters } from "../../services/masterservice.js";
import { MASTER_FIELD_TYPES, FIELD_TYPES, safeArray } from "../../utils/masterFields.js";
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
  const isSelect = fieldType === 'select' || fieldType === 'masterSelect' || !!isMaster;
  const isReadonly = field.readonly || false;
  const finalValue = value !== undefined ? value : field.defaultValue || '';

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!isMaster || isReadonly) return;
        setLoading(true);

        // ✅ STATIC DROPDOWN (like statuses)
        if (Array.isArray(MASTER_FIELD_TYPES[isMaster])) {
          const staticOptions = MASTER_FIELD_TYPES[isMaster].map((val) => ({
            id: val,
            name: val,
          }));
          setOptions(staticOptions);
          setLoading(false);
          return; // 🚨 CRITICAL: Skip API call
        }

        // ✅ DYNAMIC (API call)
        const data = await getMasters(isMaster === 'item' ? 'items' : isMaster);
        setOptions(safeArray(data));
      } catch (err) {
        console.error(`Failed to load ${isMaster}:`, err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
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
      ) : isSelect ? (
        <select {...inputProps}>
          <option value="">Select {labelText}</option>
          {safeArray(field.options || options).map(opt => {
            // Handle both string arrays ['Active'] and object arrays [{label, value}]
            const isString = typeof opt === 'string';
            const optValue = isString ? opt : (opt.value || opt.id || '');
            const optLabel = isString ? opt : (opt.label || opt.name || opt.value || opt.id || '');
            return (
              <option key={optValue} value={optValue}>
                {optLabel}
              </option>
            );
          })}
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
