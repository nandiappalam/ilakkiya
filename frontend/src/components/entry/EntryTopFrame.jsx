import React, { useState, useEffect } from 'react';
import { getMasters } from '../../services/api.js';



/**
 * EntryTopFrame - 3 or 4-column info bar for Entry pages
 * Used for header fields like S.No, Date, Remarks, etc.
 * Styled with Blue & White theme
 * 
 * @param {Array} fields - Array of field objects { label, name, value, onChange, type, options, masterType }
 * @param {Object} data - Form data object
 * @param {Function} onChange - Change handler function
 * @param {Number} columns - Number of columns (default 3)
 */

const masterTableMap = {
  papad_companies: 'papad_companies',
  suppliers: 'suppliers',
  customers: 'customers',
  items: 'items',
  flour_mills: 'flour_mills',
  areas: 'areas',
  weights: 'weights',
  ledgers: 'ledgers',
  godowns: 'godowns',
};


import { MASTER_FIELD_TYPES } from '../../utils/masterFields';
import { validateEntryConfig } from '../../utils/validateEntryPage';
import { DEBUG } from '../../config/debug';

export const EntryTopFrame = ({ fields = [], data = {}, onChange = () => {}, columns: colCount = 3, taxType, taxRate, onTaxChange }) => {


  const generateSno = () => '1';

  useEffect(() => {
    if (!data.date) {
      onChange({ target: { name: 'date', value: new Date().toISOString().split('T')[0] } });
    }
  }, []);

  const normalizeFields = (fields) => {
    let hasSno = false;

    const updatedFields = fields.map((field) => {
      // Detect S.No field
      if (
        field.name === 'sno' ||
        field.name === 's_no' ||
        field.name === 'sNo'
      ) {
        hasSno = true;

        return {
          ...field,
          type: 'auto',      // force auto
          readOnly: true     // prevent editing
        };
      }

      return field;
    });

    // If S.No not present → ADD it automatically at FIRST POSITION
    if (!hasSno) {
      updatedFields.unshift({
        name: 'sno',
        label: 'S.No',
        type: 'auto',
        readOnly: true
      });
    }

    return updatedFields;
  };

  const normalizedFields = normalizeFields(fields);
  const processedFields = normalizedFields.map(field => {
const isMaster = field.masterType || Object.keys(MASTER_FIELD_TYPES).includes(field.name);
    
    if (isMaster && field.type !== 'master') {

      return {
        ...field,
        type: 'master',
        masterType: field.masterType || field.name + 's'
      };
    }
    
    return field;
  });

  validateEntryConfig(processedFields, []);

  const columns = Array.from({ length: colCount }, () => []);
  
  processedFields.forEach((field, index) => {
    columns[index % colCount].push(field);
  });

  const handleChange = (name, value) => {
    onChange({ target: { name, value } });
    
    if (onTaxChange && (name === 'tax_type' || name === 'tax_rate')) {
      onTaxChange({ taxType: data.tax_type || 'Exclusive', taxRate: parseFloat(data.tax_rate) || 18 });
    }
  };

  const gridStyle = {
    ...styles.infoBar,
    gridTemplateColumns: `repeat(${colCount}, 1fr)`,
  };

  return (
    <div className="info-bar" style={gridStyle}>
      {columns.map((column, colIndex) => (
        <div key={colIndex} style={styles.column}>
          {column.map((field) => (
            <MasterFieldWrapper 
              key={field.name} 
              field={field} 
              data={data}
              onChange={handleChange}
              autoFillFields={field.autoFillFields || []}
              generateSno={generateSno}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

const MasterFieldWrapper = ({ field, data, onChange, autoFillFields = [], generateSno }) => {
  const [masterOptions, setMasterOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMaster, setSelectedMaster] = useState(null);

  if (field.type === 'auto') {
    return (
      <div className="field-group" style={styles.fieldGroup}>
        <label style={styles.label}>{field.label}</label>
        <input
          type="text"
          value={generateSno()}
          readOnly
          style={styles.input}
          className="form-control"
        />
      </div>
    );
  }

  useEffect(() => {
    if (field.masterType) {
      const fetchMasterData = async () => {
        setLoading(true);
        try {
          const tableName = masterTableMap[field.masterType] || field.masterType;
          const rawResult = await getMasters(tableName);
          if (!rawResult) return; // 🔥 Safe exit

          const resultData = rawResult.data || [];
          if (DEBUG) {
            console.log(`[Master ${field.masterType}]`, resultData.length, 'options');
          }
          setMasterOptions(resultData);
        } catch (err) {
          console.error(`Error fetching ${field.masterType}:`, err);
          setMasterOptions([]);
        } finally {
          setLoading(false);
        }
      };
      fetchMasterData();
    }
  }, [field.masterType]);

  const handleMasterSelect = async (selectedId) => {
    if (!selectedId || !field.masterType) return;

    try {
      const tableName = masterTableMap[field.masterType] || field.masterType;
      const result = await getMasters(tableName);
      const masterRecord = (result.data || []).find(r => r.id == selectedId) || null;

      setSelectedMaster(masterRecord);

      if (field.masterType === 'customers') {
        if (masterRecord.address) onChange('address', masterRecord.address);
        if (masterRecord.phone_res || masterRecord.phone_off) onChange('phone_res', masterRecord.phone_res || masterRecord.phone_off || '');
        if (masterRecord.mobile) onChange('mobile', masterRecord.mobile);
        if (masterRecord.gst_no) onChange('gst_no', masterRecord.gst_no);
      } else if (field.masterType === 'suppliers') {
        if (masterRecord.address) onChange('address', masterRecord.address);
        if (masterRecord.phone_res || masterRecord.phone_off) onChange('phone_res', masterRecord.phone_res || masterRecord.phone_off || '');
        if (masterRecord.mobile) onChange('mobile', masterRecord.mobile);
        if (masterRecord.gst_no) onChange('gst_no', masterRecord.gst_no);
      } else if (field.masterType === 'items') {
        if (masterRecord.rate) onChange('rate', masterRecord.rate);
        if (masterRecord.unit) onChange('unit', masterRecord.unit);
      }

      autoFillFields.forEach(fillField => {
        if (masterRecord[fillField]) {
          onChange(fillField, masterRecord[fillField]);
        }
      });
    } catch (err) {
      console.error('Auto-fill failed:', err);
    }
  };

  const handleChange = async (e) => {
    const value = e.target.value;
    onChange(field.name, value);
    await handleMasterSelect(value);
  };

  if (field.masterType) {
    return (
      <div className="field-group" style={styles.fieldGroup}>
        <label style={styles.label}>{field.label}</label>
        <select
          name={field.name}
          value={data[field.name] || ''}
          onChange={handleChange}
          style={styles.input}
          disabled={loading}
        >
          <option value="">Select...</option>
{masterOptions.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.name || opt.flourmill || opt.godown_name || opt.item_name || opt.supplier_name || opt.customer_name || String(opt.id)}
            </option>
          ))}
        </select>
        {selectedMaster && (
          <div style={{fontSize: '11px', color: '#2e7d32', marginTop: '2px'}}>
            Auto-filled: {selectedMaster.address || selectedMaster.rate ? '✓' : ''}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="field-group" style={styles.fieldGroup}>
      <label style={styles.label}>{field.label}</label>
      {field.type === 'select' ? (
        <select
          name={field.name}
          value={data[field.name] || ''}
          onChange={(e) => onChange(field.name, e.target.value)}
          style={styles.input}
        >
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={field.type || 'text'}
          name={field.name}
          value={data[field.name] || ''}
          onChange={(e) => onChange(field.name, e.target.value)}
          style={styles.input}
        />
      )}
    </div>
  );
};

const styles = {
  infoBar: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
    padding: '20px',
    borderBottom: '2px solid #9fb6dd',
    backgroundColor: '#e9eef7',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  fieldGroup: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '8px',
  },
  label: {
    width: '80px',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#1f3f67',
    marginRight: '8px',
  },
  input: {
    flex: 1,
    padding: '8px 12px',
    border: '1px solid #7fa1d6',
    borderRadius: '4px',
    fontSize: '13px',
    backgroundColor: '#ffffff',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
};

export default EntryTopFrame;

