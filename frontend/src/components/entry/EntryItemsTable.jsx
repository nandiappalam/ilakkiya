import React, { useState, useEffect, useCallback } from 'react';
import { calculateRow } from '../../utils/taxCalc';
import { validateEntryConfig } from '../../utils/validateEntryPage';
import { api, getMasters, getNextLot } from '../../services/api.js';
import { safeArray } from './safeArray.js';
import { DEBUG } from '../../config/debug';

const MasterSelectCell = ({ value, valueId, masterType, onChange, rowIndex, cellKey }) => {
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
        const table = masterType.replace('_master', '');
        if (DEBUG) console.log(`Fetching masters: ${masterType} -> table: ${table}`);
        const result = await getMasters(table);
        if (!result) return;
        const data = safeArray(result.data || result);
        setOptions(data);
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
    const selectedId = e.target.value;
    const selectedOption = options.find(opt => String(opt.id) === selectedId);
    const displayValue = selectedOption ? (selectedOption.item_name || selectedOption.name || String(selectedOption.id)) : selectedId;
    console.log('🎯 MasterSelectCell CHANGE:', { cellKey, selectedId, displayValue, selectedOption, totalOptions: options.length });
    // Pass both ID and display name to parent handler
    onChange(rowIndex, cellKey, displayValue, selectedId);
  };

  const safeOptions = Array.isArray(options) ? options : [];
  // Bind select value to the stored ID
  const selectValue = valueId ? String(valueId) : '';

  return (
    <select value={selectValue} onChange={handleChange} style={styles.cellInput} disabled={loading} className="table-input">
      <option value="">{loading ? 'Loading...' : '-- Select --'}</option>
      {safeOptions.map((opt) => (
        <option key={opt.id} value={String(opt.id)}>
          {opt.item_name || opt.name || String(opt.id)}
        </option>
      ))}
    </select>
  );
};

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
  taxType = 'Exclusive',
  taxRate = 18
}) => {

  const generateLot = async () => {
    try {
      const result = await getNextLot();
      return safeArray(result)[0]?.lot_no || 'LOT001';
    } catch (err) {
      console.error('getNextLot failed:', err);
      return 'LOT001';
    }
  };

  // Auto first row
  useEffect(() => {
    if (data.length === 0) {
      const newRow = {
        item_name: '',
        item_id: '',
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
    }
  }, []);

  // Auto lot logic
  useEffect(() => {
    if (lotMode === 'auto' && data.length > 0 && !data[0].lot_no) {
      generateLot().then(lot => {
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
        const lotResult = await getNextLot();
        newLot = safeArray(lotResult)[0]?.lot_no || 'LOTERR';
      } catch (err) {
        console.error('Auto lot generation failed:', err);
        newLot = 'LOTERR';
      }
    }

    const newRow = {
      item_name: '',
      item_id: '',
      lot_no: newLot,
      qty: '',
      weight: '',
      rate: '',
      disc: '0',
      tax_rate: taxRate.toString(),
      amount: 0,
      tax_amount: 0
    };

    onAddRow(newRow);
  };

  const handleCellChange = useCallback((rowIndex, key, value, valueId = null) => {
    if (key === 'item_name') {
      // Batch all item_name-related updates into a single object to avoid race conditions
      const updates = {
        item_name: value,
        lot_no: '',
        available_lots: []
      };
      if (valueId !== null) {
        updates.item_name_id = valueId;
      }
      onRowChange(rowIndex, '__batch__', updates);

      // Load available lots for this item asynchronously
      const loadLots = async () => {
        if (!value) return;
        try {
          const lots = await api(`/stock/available/${encodeURIComponent(value)}`);
          const availableLots = safeArray(lots.data || lots).filter(l => (l.balance_qty || l.remaining_quantity || 0) > 0);
          onRowChange(rowIndex, '__batch__', { available_lots: availableLots });
          if (DEBUG) console.log(`Loaded ${availableLots.length} lots for "${value}"`);
        } catch (err) {
          console.error(`LOT LOAD ERROR for ${value}:`, err);
          onRowChange(rowIndex, '__batch__', { available_lots: [] });
        }
      };
      loadLots();
      return;
    }

    // Block lot_no edit in auto mode
    if (lotMode === 'auto' && key === 'lot_no') return;

    // Qty validation against lot balance
    if (key === 'qty' && data[rowIndex]?.lot_no && data[rowIndex]?.available_lots) {
      const qty = parseFloat(value) || 0;
      const currentLot = data[rowIndex].available_lots.find(l => l.lot_no === data[rowIndex].lot_no);
      const balance = currentLot ? (currentLot.balance_qty || currentLot.remaining_quantity || 0) : Infinity;
      if (qty > balance) {
        alert(`Qty ${qty} > Lot balance ${balance}`);
        return;
      }
    }

    onRowChange(rowIndex, key, value);

    // Recalculate amounts
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
                if (col.key === 'lot_no') {
                  if (lotMode === 'auto') {
                    return (
                      <td key={col.key}>
                        <input
                          type="text"
                          value={row.lot_no || 'Auto...'}
                          readOnly
                          className="table-input"
                          style={{ backgroundColor: '#f0f8ff', fontWeight: 'bold' }}
                          title="Auto-generated lot"
                        />
                      </td>
                    );
                  } else {
                    return (
                      <td key={col.key}>
                        <select
                          value={row.lot_no || ''}
                          onChange={(e) => onRowChange(rowIndex, 'lot_no', e.target.value)}
                          disabled={!row.item_name || !(row.available_lots?.length > 0)}
                          className="table-input"
                        >
                          {!row.item_name ? (
                            <option value="">Select Item First</option>
                          ) : !row.available_lots?.length ? (
                            <option value="">No lots available</option>
                          ) : (
                            <>
                              <option value="">Select Lot</option>
                              {row.available_lots.map((lot) => (
                                <option key={lot.lot_no} value={lot.lot_no}>
                                  {lot.lot_no} ({lot.balance_qty || lot.remaining_quantity || 0} left)
                                </option>
                              ))}
                            </>
                          )}
                        </select>
                      </td>
                    );
                  }
                }

                return (
                  <td key={col.key}>
                    {editable ? (
                      col.type === 'masterSelect' ? (
                        <MasterSelectCell
                          value={row[col.key]}
                          valueId={row[`${col.key}_id`]}
                          masterType={col.masterType}
                          onChange={handleCellChange}
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

