import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, getMasters } from '../utils/api'


import EntryTopFrame from './entry/EntryTopFrame'
import EntryItemsTable from './entry/EntryItemsTable'
import EntryBottomSummary from './entry/EntryBottomSummary'
import EntryActions from './entry/EntryActions'
import './SalesCreate.css'

/**
 * PurchaseCreation
 * Single-file implementation:
 * - EntryItemsTable calculates row values (amount, tax_amount, weight)
 * - This page ONLY aggregates totals and builds backend payload
 */
const PurchaseCreation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    s_no: '',
    supplier_id: '',
    date: new Date().toISOString().split('T')[0],
    inv_no: '',
    inv_date: '',
    godown_id: '',
    pay_type: 'Cash',

    // Supplier formatted details (auto-filled)
    supplier_details: '',


    tax_type: 'Exclusive',
    tax_rate: 5,

    type: 'Urad',
    remarks: ''
  })

  // Backend (/routes/purchases.js) expects legacy shape inside req.body: { formData, items, totals }
  // IMPORTANT: purchase handler reads: formData.date, formData.supplier, formData.payType, formData.invNo,
  // formData.invDate, formData.godown, formData.taxType, formData.type, formData.address, formData.sno, etc.
  const backendFormData = useMemo(() => {
    return {
      date: formData.date,
      supplier: formData.supplier_id,
      payType: formData.pay_type,
      address: formData.supplier_details || formData.address,
      invNo: formData.inv_no,
      invDate: formData.inv_date,
      godown: formData.godown_id,
      taxType: formData.tax_type, // Use actual tax_type from form

      tax_percent: formData.tax_rate,
      type: formData.type, // purchase_type
      sno: formData.s_no || 1,
      remarks: formData.remarks,
      // Keep fields that may be used by ledger helper
      supplier_id: formData.supplier_id
    }
  }, [formData])

  const [tableData, setTableData] = useState([]);
  const [deductions, setDeductions] = useState([]);
  const [selectedDeductions, setSelectedDeductions] = useState([]);

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Fetch Masters and Existing Record
  useEffect(() => {
    const loadDeductions = async () => {
      try {
        // Changed from 'purchase_deduction_master' to 'deduction_purchase' to match backend whitelist
        const res = await getMasters('deduction_purchase');
        const data = res?.data || res;
        setDeductions(Array.isArray(data) ? data : []);
      } catch (err) { console.error('Deduction load failed', err); }
    };

    const fetchNextSNo = async () => {
      if (id) return;
      try {
        // Mandatory: endpoint behavior returns { next_sno: number }
        const result = await api('/purchases/next-sno');
        if (result?.next_sno) {
          setFormData(prev => ({ ...prev, s_no: String(result.next_sno) }));
        } else if (result?.data?.s_no) {
          // backward compatibility
          setFormData(prev => ({ ...prev, s_no: String(result.data.s_no) }));
        }
      } catch (error) {
        console.error('Error fetching next s_no:', error);
      }
    };

    const fetchPurchase = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const result = await api(`/purchases/${id}`);
        if (result) {
          setFormData({
            s_no: String(result.s_no),
            supplier_id: result.supplier,
            supplier_details: result.address || '',
            address: result.address || '',
            date: result.date,

            inv_no: result.inv_no,
            inv_date: result.inv_date || '',
            godown_id: result.godown,
            pay_type: result.pay_type,
            tax_type: result.tax_type || 'Exclusive',
            tax_rate: result.tax_percent || 5,
            gst_no: result.gst_no || '',
            email: result.email || '',
            type: result.type || 'Urad',
            remarks: result.remarks || ''
          });
          setTableData((result.items || []).map(it => ({
            ...it,
            disc: it.disc_percent,
            tax_rate: it.tax_percent,
            item_id: it.item_id || it.item_name, // Ensure item_id is populated
          })));
          setSelectedDeductions((result.deductions || []).map(d => ({
            id: d.deduction_id || d.deduction_purchase_id,
            name: d.deduction_name,
            amount: d.amount,
            type: d.type || 'LESS',
            calculation_type: d.calculation_type || d.calc_type,
            percentage: d.percentage || d.value || 0,
            remarks: d.remarks || ''
          })));
        }
      } catch (err) { console.error('Fetch error:', err); }
      finally { setLoading(false); }
    };

    loadDeductions();
    fetchNextSNo();
    fetchPurchase();
  }, [id]);

  const handleTopFrameChange = useCallback((e) => {
    const { name, value } = e.target

    if (name === 'supplier_id') {
      setFormData((prev) => ({ ...prev, supplier_id: value }))
      return
    }

    setFormData((prev) => ({ ...prev, [name]: value }))
  }, [])

  const handleRowChange = useCallback((index, key, value) => {
    setTableData((prevRows) => {
      const newRows = [...prevRows]
      if (key === '__batch__' && typeof value === 'object') {
        newRows[index] = { ...newRows[index], ...value }
      } else {
        newRows[index] = { ...newRows[index], [key]: value }
      }
      return newRows;
    });
  }, []);

  const addRow = useCallback((newRow = {}) => {
    setTableData((prev) => [...prev, newRow]);
  }, []);

  const deleteRow = useCallback((index) => {
    setTableData((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const deleteDeduction = useCallback((index) => {
    setSelectedDeductions(prev => prev.filter((_, i) => i !== index));
  }, []);

  const validItems = useMemo(() => { // Use tableData here
    return (tableData || []).filter((r) => {
      return (
        r?.item_name &&
        Number(r?.qty) > 0 &&
        Number(r?.rate) > 0
      )
    })
  }, [tableData]);

  // ERP Calculation Logic (FINAL canonical flow)
  // Base Amount = Qty × Rate
  // Discount     = Base × Disc%
  // Taxable      = Base − Discount
  // Tax          = Taxable × GST%
  // Net Total    = Taxable + Tax
  // Grand Total  = Net Total + ADD deductions − LESS deductions
  const erpTotals = useMemo(() => {
    const rows = validItems || [];

    // Totals from canonical item fields already calculated in EntryItemsTable
    const totalQty = rows.reduce((s, r) => s + Number(r.qty || 0), 0);
    const totalWeight = rows.reduce((s, r) => s + Number(r.total_weight || 0), 0);

    const baseAmount = rows.reduce((s, r) => s + Number(r.base_amount || 0), 0);
    const discountAmount = rows.reduce((s, r) => s + Number(r.disc_amount || 0), 0);

    const taxableAmount = Number((baseAmount - discountAmount).toFixed(2));

    const taxRate = parseFloat(formData.tax_rate) || 0;
    const taxAmount = Number((taxableAmount * (taxRate / 100)).toFixed(2)); // Apply rounding
    const netAmount = Number((taxableAmount + taxAmount).toFixed(2)); // Apply rounding

    const addDeductions = selectedDeductions
      .filter(d => String(d.type || '').toUpperCase() === 'ADD')
      .reduce((s, d) => s + (Number(d.amount || 0) || 0), 0);

    const lessDeductions = selectedDeductions
      .filter(d => String(d.type || '').toUpperCase() === 'LESS')
      .reduce((s, d) => s + (Number(d.amount || 0) || 0), 0);

    const totalDeductions = addDeductions - lessDeductions;
    const grandTotal = Number((netAmount + totalDeductions).toFixed(2));

    return {
      totalQty,
      totalWeight,
      baseAmount,
      discountAmount,
      taxable: taxableAmount,
      taxAmount,
      netAmount,
      totalDeductions,
      grandTotal
    };
  }, [validItems, formData.tax_rate, selectedDeductions]);


  const totals = useMemo(() => {
    return erpTotals; // Use the comprehensive erpTotals
  }, [erpTotals]);

  const payload = useMemo(() => ({
    date: formData.date,
    supplier_id: Number(formData.supplier_id) || 0,
    godown_id: Number(formData.godown_id) || 0,
    inv_no: String(formData.inv_no || ''),
    inv_date: formData.inv_date,
    pay_type: formData.pay_type,

    items: validItems.map((row) => ({
      item_id: Number(row.item_id || row.item_name || 0) || 0,
      item_name:
        row.item_label ||
        row.item_text ||
        row.item_display ||
        row.item_master_name ||
        row.item_name_text ||
        row.item?.name ||
        row.item_name ||
        '',

      lot_no: row.lot_no || '',

      qty: Number(row.qty || 0),
      per_unit_weight: Number(row.per_unit_weight || row.weight || 0),
      total_weight: Number(row.total_weight || row.total_wt || 0),

      rate: Number(row.rate || 0),
      disc_percent: Number(row.disc_percent || row.disc || 0),
      disc_amount: Number(row.disc_amount || 0),

      tax_percent: Number(row.tax_percent || row.tax_rate || 0),
      tax_amount: Number(row.tax_amount || 0),

      amount: Number(row.amount || 0)
    })),

    totals: {
      totalQty: Number(erpTotals.totalQty || 0),
      totalWeight: Number(erpTotals.totalWeight || 0),
      totalAmount: Number(erpTotals.baseAmount || 0),
      taxAmount: Number(erpTotals.taxAmount || 0),
      netAmount: Number(erpTotals.netAmount || 0),
      deductionAmount: Number(erpTotals.totalDeductions || 0),
      grandTotal: Number(erpTotals.grandTotal || 0)
    }
  }), [formData, validItems, erpTotals]);

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      // VALIDATION (client-side, must prevent backend 400/500)
      if (!formData?.date || !formData?.supplier_id || validItems.length === 0) {
        setError('Date, Supplier, and at least one item required')
        return
      }

      // Ensure inv_date exists (backend may require it depending on schema)
      // If user leaves it blank, keep as empty string.

      console.log('🚀 PURCHASE SAVE PAYLOAD:', JSON.stringify(payload, null, 2))
      setLoading(true)

      const method = id ? 'PUT' : 'POST';
      const url = id ? `/purchases/${id}` : '/purchases';

      // backend/routes/purchases.js expects legacy keys inside totals:
      // totals.baseAmount, totals.discAmount, totals.grandTotal
      // It also expects item keys: itemName, lotNo, qty, weight, rate, disc, tax, amount
      const result = await api(url, {
        method: method,
        body: {
          formData: backendFormData,
          items: payload.items.map((it) => ({ // Map to backend expected item keys
            item_id: Number(it.item_id ?? it.item_name ?? 0) || 0,
            item_name: String(it.item_name ?? it.item_id ?? ''),
            lotNo: it.lot_no,
            qty: it.qty,
            per_unit_weight: it.per_unit_weight,
            total_weight: it.total_weight,
            rate: it.rate,
            disc_percent: it.disc_percent,
            disc_amount: it.disc_amount,
            tax_percent: it.tax_percent,
            tax_amount: it.tax_amount,
            amount: it.amount,
          })),
          totals: {
            totalQty: totals.totalQty,
            totalWeight: totals.totalWeight,
            totalAmount: totals.taxable, // This is the taxable amount
            baseAmount: totals.baseAmount,
            discAmount: totals.discountAmount,
            taxAmount: totals.taxAmount,
            netAmount: totals.netAmount,
            deductionAmount: totals.totalDeductions, // backend expects deductionAmount
            grandTotal: totals.grandTotal,
            // keep backend-expected container
            deductions: { autoWages: 0, vatPercent: 0, vat: 0 },
          },
          deductions: selectedDeductions.map(d => ({ // Pass full deduction details
            deduction_id: d.id,
            deduction_name: d.name,
            type: d.type,
            calculation_type: d.calculation_type,
            percentage: d.percentage,
            affect_gst: d.affect_gst,
            amount: d.amount,
          }))
        }
      })

      if (!result) {
        setError('API failed (null response)')
        return
      }

      if (result.success) {
        alert(`Purchase ${id ? 'updated' : 'saved'} successfully!`);
        if (id) navigate('/entry/purchase-display');

        if (!id) { // Only reset form if it's a new creation
          setSuccess('Purchase created successfully!')
          setFormData({
            s_no: '',
            contact_person: '',
            supplier_id: '',
            date: new Date().toISOString().split('T')[0],
            inv_no: '',
            inv_date: '',
            godown_id: '',
            pay_type: 'Credit',
            address: '',
            phone: '',
            email: '',
            tax_type: 'Exclusive',
            tax_rate: 5,
            gst_no: '',
            email: '',
            type: 'Urad',
            remarks: ''
          })
          setTableData([])
          setSelectedDeductions([]);
          // Fetch next s_no for new entry
          const nextResult = await api('/purchases/next-sno');
          if (nextResult.success && nextResult.data?.s_no) {
            setFormData(prev => ({ ...prev, s_no: String(nextResult.data.s_no) }));
          }
          setTimeout(() => setSuccess(''), 3000)
        }
      } else {
        setError(result.message || 'Error creating purchase')
      }
    } catch (err) {
      setError(err?.message || 'Error creating purchase')
    } finally {
      setLoading(false)
    }
  }

  const handleDeductionAdd = (dedId) => {
    const master = deductions.find(d => String(d.id) === String(dedId));
    if (!master) return;

    // Check if deduction already added
    if (selectedDeductions.some(d => String(d.id) === String(dedId))) {
      alert('This deduction has already been added.');
      return;
    }

    const calcType = master.calculation_type || master.calc_type || 'Percentage';
    const dedValue = parseFloat(master.deduction_value || master.deduction_value || master.ded_value || 0) || 0;

    // Required: deduction amount based on ERP taxable base (we keep it simple: Percentage of erpTotals taxable base)
    let amt = 0;
    if (String(calcType).toLowerCase().includes('percent')) {
      amt = Number(erpTotals.taxable || 0) * (dedValue / 100);
    } else {
      amt = dedValue;
    }

    setSelectedDeductions(prev => [...prev, {
      id: master.id,
      name: master.ded_name || master.name || master.deduction_name || 'Unnamed',
      amount: amt,
      type: String(master.type || master.deduction_type || 'LESS').toUpperCase(),
      calculation_type: calcType,
      percentage: calcType === 'Percentage' ? dedValue : 0,
      affect_gst: String(master.affect_gst || master.affect_cost_of_goods || 'NO').toUpperCase(),
      remarks: ''
    }]);
  };

  const formatNumber = (num) => Number(num || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3
  });

  // Define fields for EntryTopFrame - organized by columns (matches SalesCreate)
  // ✅ FIXED Purchase fields - NO 'value', supplier autofill
  const topFrameFields = [
    { name: 's_no', label: 'S.No', readOnly: true },
    { name: 'date', label: 'Date', type: 'date' },
    { name: 'inv_no', label: 'Invoice No', type: 'text' },
    { name: 'inv_date', label: 'Invoice Date', type: 'date' },
    { name: 'supplier_id', label: 'Supplier', type: 'masterSelect', masterType: 'suppliers' },

    { name: 'address', label: 'Address', type: 'textarea' },

    { name: 'godown_id', label: 'Godown', type: 'masterSelect', masterType: 'godowns' },
    { name: 'pay_type', label: 'Pay Type', type: 'select', options: [
      {value: 'Credit', label: 'Credit'},
      {value: 'Cash', label: 'Cash'}
    ] },

    { name: 'tax_type', label: 'Tax Type', type: 'select', options: [
      {value: 'Exclusive', label: 'Exclusive'},
      {value: 'Inclusive', label: 'Inclusive'},
      {value: 'Without Tax', label: 'Without Tax'}
    ] },
    { name: 'type', label: 'Type', type: 'select', options: [
      {value: 'Urad', label: 'Urad'}, {value: 'Rice', label: 'Rice'}, {value: 'Flour', label: 'Flour'}, {value: 'Other', label: 'Other'}
    ]},
    { name: 'remarks', label: 'Remarks', type: 'textarea' },
  ];

  // ✅ FIXED Purchase columns + autoLotMode=true (creation)
  const columns = [
    { key: 's_no', title: 'S.No', readOnly: true },
    { key: 'item_name', title: 'Item', type: 'masterSelect', masterType: 'items' },
    { key: 'lot_no', title: 'Lot No' },
    { key: 'qty', title: 'Qty', type: 'number' },
    { key: 'weight', title: 'Per Unit Wt', type: 'masterSelect', masterType: 'weights' }, // Changed to masterSelect
    { key: 'total_wt', title: 'Total Wt', readOnly: true },
    { key: 'rate', title: 'Rate', type: 'number' },
    { key: 'disc', title: 'Disc%', type: 'number' },
    { key: 'tax_rate', title: 'Tax%', type: 'number' },
    { key: 'amount', title: 'Amount', readOnly: true } // This is taxable amount
  ];

  // Define totals for EntryTotalsRow - matches SalesCreate
  // This is now handled by EntryBottomSummary

  // Bottom summary fields - matches SalesCreate
  const summaryFields = [
    { name: 'baseAmount', label: 'Base Amount', value: erpTotals.baseAmount, readOnly: true },
    { name: 'discAmount', label: 'Discount', value: erpTotals.discountAmount, readOnly: true },
    { name: 'taxable', label: 'Taxable', value: erpTotals.taxable, readOnly: true },
    { name: 'taxAmount', label: 'Tax', value: erpTotals.taxAmount, readOnly: true },
    { name: 'netAmount', label: 'Net', value: erpTotals.netAmount, readOnly: true },
    { name: 'totalDeductions', label: 'Deduction', value: erpTotals.totalDeductions, readOnly: true },
    { name: 'grandTotal', label: 'Grand Total', value: erpTotals.grandTotal, readOnly: true },
  ];

  const deductionFields = [
    // This will be handled by the dedicated deductions section
  ];

  return (
    <div className="window">
      <div className="screen-title">Purchase Creation</div>

      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}

      <form onSubmit={handleSubmit}>

        {/* Local CSS for ERP layout (ensures LEFT/RIGHT) */}
        <style>{`
          .erp-bottom-layout{display:flex;gap:20px;align-items:flex-start;margin-top:20px;}
          .deduction-panel{flex:1;background:#fff;border:1px solid #dcdcdc;padding:15px;}
          .erp-summary-panel{width:350px;background:#fff;border:1px solid #dcdcdc;padding:15px;}
          .grand-total{margin-top:15px;padding-top:10px;border-top:2px solid #1e4db7;font-size:22px;font-weight:bold;color:#1e4db7;}
          .deduction-table{width:100%;border-collapse:collapse;}
          .deduction-table th,.deduction-table td{border-bottom:1px solid #e5e5e5;padding:8px;}
          .deduction-table th{background:#f6f8ff;text-align:left;}
        `}</style>
        <EntryTopFrame
          fields={topFrameFields}
          data={formData}
          onChange={handleTopFrameChange}
          columns={3}
        />

        <EntryItemsTable
          columns={columns}
          data={tableData} // Use tableData here
          onRowChange={handleRowChange}
          onAddRow={addRow}
          onDeleteRow={deleteRow}
          showActions={true}
          lotMode="auto"
          taxType={formData.tax_type}
          taxRate={formData.tax_rate}
        />

        {/* Table Footer for Qty and Weight */}
        <div className="table-footer">
          <div className="footer-line"></div>
          <div className="footer-totals">
            Total Qty: <span>{formatNumber(erpTotals.totalQty)}</span> |
            Total Weight: <span>{formatNumber(erpTotals.totalWeight)} KG</span>
          </div>
          <div className="footer-line"></div>
        </div>

        <div className="erp-bottom-layout">

          {/* (ERP layout) LEFT -> Deduction Table | RIGHT -> ERP Totals */}

          {/* LEFT SIDE */}
          <div className="deduction-panel">

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ margin: 0 }}>Deductions</h3>
              <select 
                onChange={(e) => handleDeductionAdd(e.target.value)} 
                className="table-input" 
                style={{ width: '200px', height: '30px' }}
              >
                <option value="">+ Add Deduction</option>
                {deductions.map(d => (
                  <option key={d.id} value={d.id}>{d.ded_name || d.name || d.deduction_name}</option>
                ))}
              </select>
            </div>

            <table className="deduction-table">
              <thead>
                <tr>
                  <th>Deduction</th>
                  <th>%</th>
                  <th>Amt</th>
                  <th>Calculation</th>
                </tr>
              </thead>

              <tbody>
                {selectedDeductions.map((row, index) => (
                  <tr key={index}>

                    <td>
                      <select
                        value={row.deduction_id || row.id || ''}
                        onChange={(e) => {
                          const updated = [...selectedDeductions];
                          const nextId = e.target.value;
                          const master = deductions.find(d => String(d.id) === String(nextId));
                          if (!master) return;
                          updated[index] = {
                            ...updated[index],
                            deduction_id: master.id,
                            id: master.id,
                            name: master.ded_name || master.name || master.deduction_name,
                            calculation_type: master.calculation_type || master.calc_type,
                            percentage: Number(master.deduction_value || master.ded_value || 0) || 0,
                            type: String(master.type || master.deduction_type || updated[index].type || 'LESS').toUpperCase(),
                          };
                          setSelectedDeductions(updated);
                        }}
                      >
                        <option value="">Select</option>
                        {(deductions || []).map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.ded_name || d.name}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td>
                      <input
                        type="number"
                        value={Number(row.percent ?? row.percentage ?? 0)}
                        onChange={(e) => {
                          const updated = [...selectedDeductions];
                          const pct = parseFloat(e.target.value) || 0;
                          updated[index].percent = pct;
                          updated[index].percentage = pct;
                          const base = Number(erpTotals.taxable || 0);
                          updated[index].amount = base * (pct / 100);
                          setSelectedDeductions(updated);
                        }}
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        value={Number(row.amount || 0)}
                        onChange={(e) => {
                          const updated = [...selectedDeductions];
                          updated[index].amount = parseFloat(e.target.value) || 0;
                          setSelectedDeductions(updated);
                        }}
                      />
                    </td>

                    <td>
                      <select
                        value={row.calculation || row.type || 'LESS'}
                        onChange={(e) => {
                          const updated = [...selectedDeductions];
                          updated[index].calculation = e.target.value;
                          updated[index].type = e.target.value;
                          setSelectedDeductions(updated);
                        }}
                      >
                        <option value="ADD">ADD</option>
                        <option value="LESS">LESS</option>
                      </select>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>

          </div>

          {/* RIGHT : ERP TOTALS */}
          <div className="erp-summary-panel">

            <div>Total Qty : {formatNumber(erpTotals.totalQty)}</div>

            <div>
              Total Weight : {formatNumber(erpTotals.totalWeight)} KG
            </div>

            <hr />

            <div>
              Base Amount : ₹{formatNumber(erpTotals.baseAmount)}
            </div>

            <div>
              Discount : ₹{formatNumber(erpTotals.discountAmount)}
            </div>

            <div>
              Taxable : ₹{formatNumber(erpTotals.taxable)}
            </div>

            <div>
              Tax : ₹{formatNumber(erpTotals.taxAmount)}
            </div>

            <div>
              Net Total : ₹{formatNumber(erpTotals.netAmount)}
            </div>

            <div>
              Deductions : ₹{formatNumber(erpTotals.totalDeductions)}
            </div>

            <div className="grand-total">
              Grand Total : ₹{formatNumber(erpTotals.grandTotal)}
            </div>

          </div>

        </div>

        {/* MODULAR: EntryActions - Save button - matches SalesCreate */}
        <EntryActions
          onSave={handleSubmit}
          loading={loading}
          saveText="Save"
        />
      </form>
    </div>
  )
}

export default PurchaseCreation
