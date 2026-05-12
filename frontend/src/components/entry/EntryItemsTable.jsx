import React, { useState, useEffect, useCallback } from 'react';

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

  const safeOptions = Array.isArray(options) ? options : [];

  const handleChange = (e) => {
    const selectedId = e.target.value;
    if (DEBUG) console.log('🎯 MasterSelectCell CHANGE:', { cellKey, selectedId });

    const selectedItem = safeOptions.find(opt => String(opt.id) === String(selectedId));
    const selectedName = selectedItem?.item_name ?? selectedItem?.name ?? selectedItem?.printname ?? selectedItem?.print_name ?? '';

    if (cellKey === 'item_name') {
      // When item_name is selected, update both item_id and item_name in a batch
      onChange(rowIndex, '__batch__', {
        item_id: selectedItem?.id ?? selectedId,
        item_name: selectedName,
        item_label: selectedName, // Keep item_label for consistency if needed elsewhere
        // Reset other item-related fields when item_name changes
        lot_no: '',
        qty: '',
        weight: '',
        total_wt: '',
        available_lots: [],
        available_lots_loaded: false, // Mark lots as not loaded for the new item
      });
      return;
    }
    onChange(rowIndex, cellKey, selectedId, selectedId);
  };

  const selectValue = valueId ? String(valueId) : '';

  return (
    <select value={selectValue} onChange={handleChange} style={styles.cellInput} disabled={loading} className="table-input">
      {/* Keep compatibility with existing weight dropdown values: store ID, also keep computed per_unit_weight */}
      <option value="">{loading ? 'Loading...' : '-- Select --'}</option>
      {safeOptions.map((opt) => (
        <option key={opt.id} value={String(opt.id)}>
          {opt.item_name || opt.name || opt.printname || opt.print_name || String(opt.id)}
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
  const [weightMap, setWeightMap] = useState({});


  // Effect to load available lots when item_id changes for a row
  useEffect(() => {
    data.forEach((row, rowIndex) => {
      // Only load if item_id exists and lots for this item haven't been loaded yet
      if (row.item_id && !row.available_lots_loaded) {
        const loadLots = async () => {
          try {
            const lots = await api(`/stock/available/${encodeURIComponent(row.item_id)}`);
            const availableLots = safeArray(lots.data || lots).filter(l => (l.balance_qty || l.remaining_quantity || 0) > 0);
            onRowChange(rowIndex, '__batch__', { available_lots: availableLots, available_lots_loaded: true });
            if (DEBUG) console.log(`Loaded ${availableLots.length} lots for "${row.item_name}" (ID: ${row.item_id})`);
          } catch (err) {
            console.error(`LOT LOAD ERROR for ${row.item_name} (ID: ${row.item_id}):`, err);
            onRowChange(rowIndex, '__batch__', { available_lots: [], available_lots_loaded: true });
          }
        };
        loadLots();
      }
    });
  }, [data, onRowChange]); // Depend on data and onRowChange


  // Load weight map for numeric calculations (kept for future, not required)
  useEffect(() => {
    const loadWeightMap = async () => {
      try {
        const result = await getMasters('weights');
        const weights = safeArray(result?.data || result);
        const map = {};
        weights.forEach(w => {
          map[w.id] = parseFloat(w.weight_value || w.weight || w.value || 0); // Use weight_value or weight from master
        });
        setWeightMap(map);
      } catch (err) {
        console.error('Weight map load failed:', err);
      }
    };
    loadWeightMap();
  }, []);


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





  const normalizeColumns = (columns) => {
    return columns.map(col => ({
      ...col,
      type: col.type || (col.key?.toLowerCase() === 'item_name' ? 'masterSelect' : undefined),
      masterType: col.masterType || (col.key?.toLowerCase() === 'item_name' ? 'items' : undefined),
    }));
  };

  const cleanedColumns = normalizeColumns(columns);

  validateEntryConfig([], cleanedColumns);

  const handleAddRow = async () => {
    try {
      // Always fetch the next lot at the moment of adding the row
      const res = await api('/masters/lots/next');

      // Support multiple response shapes
      const nextLot =
        res?.lot_no ||
        res?.data?.lot_no ||
        res?.data?.lotNo ||
        '';

      if (DEBUG) console.log('NEXT LOT for new row:', nextLot, 'raw:', res);

      const newRow = {
        sno: (Array.isArray(data) ? data.length : 0) + 1,
        
        item_id: '',
        item_name: '',
        item_label: '',

        lot_no: nextLot,
        // keep a separate computed reference for debugging/state sanity
        _lot_fetched: nextLot,


        qty: 0,
        weight: 0,
        rate: 0,
        disc: 0,
        tax_rate: 5,

        // Canonical ERP output fields (will be recalculated on edits)
        per_unit_weight: '',
        total_weight: 0,
        base_amount: 0,
        disc_amount: 0,
        tax_amount: 0,
        amount: 0
      };

      onAddRow(newRow);

    } catch (err) {
      console.error('Lot generation failed', err);
    }
  };

  const handleCellChange = useCallback((rowIndex, key, value) => {
    if (key === 'weight') {
      // eslint-disable-next-line no-console
      console.log('[EntryItemsTable] weight cell change:', { rowIndex, key, value, weightMapValue: weightMap[value] });
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

    // Prepare updates for the current change
    let updates = {};
    if (key === '__batch__') {
      updates = { ...value };
    } else {
      updates = { [key]: value };
    }

    // Recalculate ERP fields whenever any of: Qty, Per Unit Weight, Rate, Disc%, Tax%
    const currentRow = { ...data[rowIndex], ...updates };
    if (currentRow) {
      const qty = parseFloat(currentRow.qty || 0) || 0;
      const weightId = currentRow.weight; // dropdown stores ID
      const perUnitWeight =
        Number(weightMap[weightId]) ||
        Number(currentRow.per_unit_weight || 0) ||
        Number(currentRow.weight || 0) ||
        0;
      const rate = parseFloat(currentRow.rate || 0) || 0;
      const discPercent = parseFloat(currentRow.disc || 0) || 0;
      const taxPercent = parseFloat(currentRow.tax_rate ?? taxRate) || 0;

      // ✅ ERP formula structure (Qty × Rate)
      // Total weight should be Qty × Per Unit Wt
      const totalWeight = qty * perUnitWeight;
      const baseAmount = qty * rate;
      const discAmount = baseAmount * (discPercent / 100);
      const taxableAmount = baseAmount - discAmount;
      const taxAmount = Number(((taxableAmount * taxPercent) / 100).toFixed(2));
      const amount = Number((taxableAmount + taxAmount).toFixed(2));

      // Consolidate all calculated fields into the update batch
      Object.assign(updates, {
        total_wt: totalWeight,
        total_weight: totalWeight,
        base_amount: baseAmount,
        disc_amount: discAmount,
        tax_amount: taxAmount,
        amount: amount,
        per_unit_weight: perUnitWeight
      });
    }

    // Single call to update the parent state
    onRowChange(rowIndex, '__batch__', updates);
  }, [data, onRowChange, lotMode, taxRate, weightMap]);

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
                if (col.key === 's_no' || col.key === 'sno') {
                  return (
                    <td key={col.key}>
                      <input 
                        type="text" 
                        value={rowIndex + 1} 
                        readOnly 
                        style={{...styles.cellInput, backgroundColor: '#f5f5f5', textAlign: 'center'}} 
                      />
                    </td>
                  );
                }
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
                          value={row[col.key]} // This is row.item_name
                          valueId={col.key === 'item_name' ? row.item_id : row[col.key]} // Use row[col.key] as ID for other master selects
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
        <tfoot>
          <tr>
            <td colSpan={cleanedColumns.length + (showActions && editable ? 1 : 0)} style={{ textAlign: 'right', fontWeight: 'bold', padding: '12px', backgroundColor: '#f8f9fa' }}>
              Total Weight: {data.reduce((sum, row) => sum + parseFloat(row.total_wt || 0), 0).toLocaleString()} KG
            </td>
          </tr>
        </tfoot>
      </table>


      {showActions && editable && (
        <button
          type="button"
          onClick={handleAddRow}
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
