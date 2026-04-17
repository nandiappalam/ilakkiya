import React, { useState, useEffect, useCallback } from 'react';
import { calculateRow } from '../../utils/taxCalc';
import { MASTER_FIELD_TYPES } from '../../utils/masterFields';
import { validateEntryConfig } from '../../utils/validateEntryPage';
import api, { safeArray } from '../../utils/api';
import { DEBUG } from '../../config/debug';

const MasterSelectCell = ({ value, masterType, onChange, rowIndex, cellKey }) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (!masterType) {
      setOptions([]);
      return;
    }
    
    const fetchOptions = async () => {
      setLoading(true);
      try {
        const table = api.MASTER_TABLES?.[masterType] || masterType;
        if (DEBUG) console.log(`Fetching master table: ${table}`);
        const result = await api.getMasters(table);
        const data = safeArray(result);
        setOptions(data || []);
      } catch (err) {
        console.error(`Error fetching ${masterType}:`, err);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOptions();
  }, [masterType]);
  
  const handleChange = (e) => {
    const selectedOption = options.find(opt => opt.id === parseInt(e.target.value) || opt.id === e.target.value);
    const displayValue = selectedOption ? (selectedOption.item_name || selectedOption.name || String(selectedOption.id)) : e.target.value;
    onChange(rowIndex, cellKey, displayValue);
  };
  
  const currentOption = options.find(opt => (opt.item_name || opt.name || String(opt.id)) === value || opt.id === value);
  const displayValue = currentOption ? currentOption.id : '';
  
  return (
    <select value={displayValue} onChange={handleChange} style={styles.cellInput} disabled={loading}>
      <option value="">{isPurchaseReturnPage && masterType === 'items' ? (loading ? 'Loading...' : '-- Select Item --') : (loading ? 'Loading...' : 'Select')}</option>
      {options.map((opt) => (
        <option key={opt.id} value={opt.id}>
          {opt.item_name || opt.name || String(opt.id)}
        </option>
      ))}
    </select>
  );
};

const isPurchaseReturnPage = window.location.pathname.toLowerCase().includes('purchase-return');



const EntryItemsTable = ({ 
  columns = [], 
  data = [], 
  onRowChange = () => {},
  onAddRow = () => {},
  onDeleteRow = () => {},
  showActions = true,
  sectionTitle = '',
  editable = true,
  lotMode = 'select',
  itemColumnKey = 'item_name',
  taxType = 'Exclusive',
  taxRate = 18
}) => {



  const generateLot = async () => {
    try {
      const result = await api.getNextLot();
      return safeArray(result)[0]?.lot_no || 'LOT001';
    } catch (err){
      return 'LOT001';
    }
  };

// 🔥 AUTO FIRST ROW: Add empty row if none exists (ALL modes)
  useEffect(() => {
    if (data.length === 0) {
      console.log('🔧 Adding first empty row for ready UX');
      const newRow = {
        item_name: '',
        lot_no: '',
        weight: '',
        qty: '',
        total_wt: '',
        rate: '',
        disc: '',
        tax: '',
        amount: ''
      };
      onAddRow(newRow);
      return;
    }
  }, []);

  // 🔥 AUTO LOT LOGIC (only for auto mode)
  useEffect(() => {
    if (lotMode === 'auto' && data.length > 0 && !data[0].lot_no) {
      generateLot().then(lot => {
        console.log('🔧 AUTO first row lot:', lot);
        onRowChange(0, 'lot_no', lot);
      });
    }
  }, [lotMode, data.length]);

  const normalizeColumns = (columns) => {
    return columns.map(col => ({
      ...col,
      type: col.type || (col.key?.toLowerCase() === 'item_name' ? 'masterSelect' : undefined),
      masterType: col.masterType || (col.key?.toLowerCase() === 'item_name' ? 'items' : undefined)
    }));
  };

  const processedColumns = normalizeColumns(columns);
  const cleanedColumns = processedColumns.filter(col => {
    const key = col.key?.toLowerCase();
    return key !== 's_no' && key !== 'sno' && key !== 'no';
  });

  validateEntryConfig([], processedColumns);

  const isAutoLot = lotMode === 'auto';

  const handleAddRowClick = async () => {
    let newLot = '';
    if (isAutoLot) {
      try {
        const lotResult = await api.getNextLot();
        newLot = safeArray(lotResult)[0]?.lot_no || `LOTERR`;
      } catch (err) {
        console.error('Auto lot generation failed:', err);
        newLot = 'LOTERR';
      }
    }

    // Create complete new row with lot pre-filled
    const newRow = {
      item_name: '',
      lot_no: newLot,
      qty: '',
      weight: '',
      rate: '',
      disc: '0',
      tax_rate: taxRate.toString(),
      amount: 0,
      tax_amount: 0
    };

    // Call parent's onAddRow with complete row
    onAddRow(newRow);
  };

  const handleCellChange = useCallback((rowIndex, key, value) => {
    if (key === 'item_name') {
      onRowChange(rowIndex, key, value);
      onRowChange(rowIndex, 'lot_no', '');
      
      // 🔥 CRITICAL: Load available lots for dropdown
      const loadLots = async () => {
        try {
          const lots = await api.getAvailableLots(value);
          onRowChange(rowIndex, 'available_lots', lots || []);
          console.log("🔥 LOADED LOTS FOR", value, ":", lots);
        } catch (err) {
          console.error("LOT LOAD ERROR:", err);
          onRowChange(rowIndex, 'available_lots', []);
        }
      };
      loadLots();
      
      return;
    }
    
    if (lotMode === 'auto' && key === 'lot_no') return;

    if (key === 'qty' && data[rowIndex]?.availableQty !== undefined) {
      const qty = parseFloat(value) || 0;
      if (qty > data[rowIndex].availableQty) {
        alert(`Quantity ${qty} exceeds available stock ${data[rowIndex].availableQty}`);
        return;
      }
    }

    onRowChange(rowIndex, key, value);

    // Full recalc on qty/rate/disc/tax_rate change
    if (['qty', 'rate', 'disc', 'tax_rate'].includes(key) && data[rowIndex]) {
      const rowData = {
        qty: parseFloat(data[rowIndex].qty || (key === 'qty' ? value : '')) || 0,
        rate: parseFloat(data[rowIndex].rate || (key === 'rate' ? value : '')) || 0,
        disc: parseFloat(data[rowIndex].disc || 0),
        tax_rate: parseFloat(data[rowIndex].tax_rate || taxRate) || parseFloat(taxRate) || 0
      };
      const calc = calculateRow(rowData, taxType, rowData.tax_rate);
      onRowChange(rowIndex, 'tax_amount', calc.taxAmount);
      onRowChange(rowIndex, 'amount', calc.totalAmount);
    }
  }, [data, onRowChange, lotMode, taxType, taxRate]);

  return (
    <div style={styles.sectionContainer}>
      {sectionTitle && <div style={styles.sectionTitle}>{sectionTitle}</div>}
      <table style={styles.table}>
        <thead>
          <tr>
            {cleanedColumns.map((col) => (
              <th key={col.key} style={col.width ? { width: col.width } : {}}>
                {col.title}
              </th>
            ))}
            {showActions && editable && <th style={{ width: '50px' }}>Action</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
{cleanedColumns.map((col) => {
                const colKey = col.key.toLowerCase();
                
                // 🔥 STRICT AUTO LOT FIX: Force readonly input for lot_no when lotMode=auto
                // 👉 IGNORE col.type completely - NO dropdown ever in auto mode
                if (col.key === 'lot_no') {


                  return (
                    <td key={col.key}>
                      <select
                        value={row.lot_no || ''}
                        onChange={(e) => onRowChange(rowIndex, 'lot_no', e.target.value)}
                        disabled={!row.item_name}
                        className="form-control"
                      >
                        {!row.item_name ? (
                          <option value="">-- Select Item First --</option>
                        ) : (
                          <>
                            <option value="">-- Select Lot --</option>
                            {(row.available_lots || []).map((lot) => (
                              <option key={lot.lot_no} value={lot.lot_no}>
                                {lot.lot_no} {`(${lot.remaining_quantity || ''})`}
                              </option>
                            ))}

                          </>
                        )}
                      </select>
                    </td>
                  );
                }

                return (
                  <td key={col.key}>
                    {editable ? (
                      col.type === 'masterSelect' ? (
                        <MasterSelectCell
                          value={row[col.key]}
                          masterType={col.masterType}
                          onChange={onRowChange}
                          rowIndex={rowIndex}
                          cellKey={col.key}
                        />
                      ) : col.readOnly ? (
                        <input
                          type={col.type || 'text'}
                          value={row[col.key] || ''}
                          style={{...styles.cellInput, backgroundColor: '#f5f5f5'}}
                          readOnly
                        />
                      ) : (
                        <input
                          type={col.type === 'number' ? 'number' : 'text'}
                          value={row[col.key] || ''}
                          onChange={(e) => handleCellChange(rowIndex, col.key, e.target.value)}
                          style={styles.cellInput}
                          step={col.type === 'number' ? '0.01' : '1'}
                        />
                      )
                    ) : row[col.key]}
                  </td>
                );
              })}
              {showActions && editable && (
                <td style={{ textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => onDeleteRow(rowIndex)}
                    style={styles.deleteBtn}
                  >
                    ✕
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {showActions && editable && (
        <button
          type="button"
          onClick={handleAddRowClick}
          style={styles.addRowBtn}
          title="Add Row"
        >
          + Add Row
        </button>
      )}
    </div>
  );
};

const styles = {
  sectionContainer: {
    padding: '15px 20px',
    background: '#ffffff',
    margin: '10px 20px',
    borderRadius: '4px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#1f3f67',
    marginBottom: '10px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
    backgroundColor: '#fff',
    marginBottom: '15px',
  },
  cellInput: {
    width: '100%',
    height: '100%',
    border: 'none',
    padding: '4px 8px',
    fontSize: '13px',
    boxSizing: 'border-box',
    background: 'transparent',
  },
  addRowBtn: {
    padding: '8px 16px',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 'bold',
  },
  deleteBtn: {
    padding: '4px 8px',
    backgroundColor: '#f44336',
    color: '#fff',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '12px',
  },
};

export default EntryItemsTable;

