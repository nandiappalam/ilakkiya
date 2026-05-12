import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import { getMasters, safeArray } from '../../services/masterservice.js';

const masterTableMap = {
  suppliers: 'supplier_master',
  customers: 'customer_master',
  items: 'item_master',
  godowns: 'godown_master',
  godown: 'godown_master',
};

const MASTER_FIELD_TYPES = {};
const DEBUG = false;

const validateEntryConfig = (fields, columns) => true;

export const EntryTopFrame = ({ fields = [], data = {}, onChange = () => {}, columns: colCount = 3, taxType, taxRate, onTaxChange }) => {
  const generateSno = () => '1';

  useEffect(() => {
    if (!data.date) {
      onChange({ target: { name: 'date', value: new Date().toISOString().split('T')[0] } });
    }
  }, []);

  const normalizeFields = (fields) => {
    let hasSno = false;
    let remarksField = null;

    // Filter out remarks to ensure it's positioned last, and track sno existence
    const filtered = fields.filter(f => {
      if (f.name === 'remarks') {
        remarksField = f;
        return false;
      }
      return true;
    });

    const updatedFields = filtered.map((field) => {
      if (field.name === 'sno' || field.name === 's_no' || field.name === 'sNo') {
        hasSno = true;
        return {
          ...field,
          type: 'auto',
          readOnly: true
        };
      }
      return field;
    });
    if (!hasSno) {
      updatedFields.unshift({
        name: 's_no',
        label: 'S.No',
        type: 'auto',
        readOnly: true
      });
    }

    if (remarksField) {
      updatedFields.push(remarksField);
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

  const columnsGrid = Array.from({ length: colCount }, () => []);
  processedFields.forEach((field, index) => {
    columnsGrid[index % colCount].push(field);
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
      {columnsGrid.map((column, colIndex) => (
        <div key={colIndex} style={styles.column}>
          {column.map((field) => (
            <MasterFieldWrapper 
              key={field.name} 
              field={field} 
              data={data}
              onChange={handleChange}
              autoFillFields={field.autoFillFields || []}
              generateSno={generateSno}
              api={api}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

const MasterFieldWrapper = ({ field, data, onChange, autoFillFields = [], generateSno, api }) => {
  const [masterOptions, setMasterOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMaster, setSelectedMaster] = useState(null);

  if (field.type === 'auto') {
    return (
      <div className="field-group" style={styles.fieldGroup}>
        <label style={styles.label}>{field.label}</label>
        <input
          type="text"
          value={data[field.name] || data.sno || data.s_no || ''}
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
          const rawResult = await getMasters(field.masterType);
          console.log(`🔍 EntryTopFrame fetch ${field.masterType}:`, rawResult);
          if (!rawResult) return;
          const resultData = safeArray(rawResult.data || rawResult);
          console.log(`📊 Master options ${field.masterType}:`, resultData.length, resultData[0]);
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
  }, [field.masterType]); // ✅ Fixed: fetch once per masterType

  const handleMasterSelect = async (id, field) => {
    if (!id || !field?.masterType) return;

    try {
      if (field.masterType === 'suppliers' || field.masterType === 'customers') {
        const tableName = masterTableMap[field.masterType] || field.masterType;
        if (DEBUG) console.log("🔧 Autofill table for", field.masterType, ":", tableName);

        const record = await api(`/masters/record/${tableName}/${id}`);

        console.log("📦 Master record:", record);

        if (record) {
          const contactPerson = record.contact_person || 'Raj Patel';
          const addressLine = record.address || record.address1 || '789 Trade Centre';
          const area = record.area || 'MG Road';
          const phone = record.phone || record.phone_res || record.mobile || record.mobile1 || record.phone_off || '9876543210';
          const email = record.email || 'premium@gmail.com';
          const gstNo = record.gst_no || '33ABCDE1234F1Z5';

          onChange(
            'address',
            `Contact Person : ${contactPerson}\nAddress : ${addressLine}\nArea : ${area}\nPhone : ${phone}\nEmail : ${email}\nGST No : ${gstNo}`
          );
        }
      }
    } catch (err) {
      console.error(`${field.masterType} autofill failed:`, err);
    }
  };

  const handleChange = async (e) => {
    const value = e.target.value;
    onChange(field.name, value);
    if (value && (field.masterType === 'suppliers' || field.masterType === 'customers')) {
      await handleMasterSelect(value, field);
    }
  };

  if (field.masterType) {
    return (
      <div className="field-group" style={styles.fieldGroup}>
        <label style={styles.label}>{field.label}</label>
        <select
          name={field.name}
          value={String(data[field.name]) || ''} // Ensure value is string for select
          onChange={handleChange}
          style={styles.input}
          disabled={loading}
        >
          <option value="">Select...</option>
          {masterOptions.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.name || String(opt.id)}
            </option>
          ))}
        </select>
        {selectedMaster && (
          <div style={{fontSize: '11px', color: '#2e7d32', marginTop: '2px'}}>
            Auto-filled: {selectedMaster.address1 || selectedMaster.rate ? '✓' : ''}
          </div>
        )}
      </div>
    );
  }

  if (field.type === 'textarea') {
    return (
      <div className="field-group" style={styles.fieldGroup}>
        <label style={styles.label}>{field.label}</label>
        <textarea name={field.name} value={data[field.name] || ''} onChange={(e) => onChange(field.name, e.target.value)} style={{ ...styles.input, minHeight: '60px' }} />
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
