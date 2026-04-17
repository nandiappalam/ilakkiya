import React, { useState, useEffect, useCallback } from 'react'
import { createSale } from '../utils/api'
import { calculateTotals } from '../utils/taxCalc'
import './SalesCreate.css'

// Import ALL modular components from entry folder
import { 
  EntryTopFrame, 
  EntryItemsTable, 
  EntryTotalsRow, 
  EntryBottomSummary, 
  EntryActions 
} from './entry';

/**
 * SalesCreate - Sales Creation Entry Page
 * 
 * STRUCTURE from Entry/sales C.html:
 * - 3-column entry form (Col 1: BillNo, Date, PayType, TaxType, Type)
 *                        (Col 2: LorryNo, PONo, Driver, PurTrans, Remarks)
 *                        (Col 3: Customer, Address, Sender, ConsignedTo, GodownFrom)
 * - Item grid table with columns: Item Name, Lot No, Qty, Box, Rate, Disc%, Tax%, Amount
 * - Bottom totals: Bill Amt, Tax Amt, Total Amt + Deduction section
 * - Save button
 */
const SalesCreate = () => {
const [formData, setFormData] = useState({
  bill_no: '',
  date: new Date().toISOString().split('T')[0],
  pay_type: 'Credit',
  tax_type: 'Exclusive',
  tax_percent: 5,
  type: '',
  lorry_no: '',
  p_o_no: '',
  driver: '',
  pur_trans: '',
  remarks: '',
  customer_id: '',
  address: '',
  phone: '',
  sender_id: '',
  consignee_id: '',
  godown_from_id: ''
})

const [rows, setRows] = useState([{}])

// totalsData calculated in useEffect

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // ✅ LIVE TOTALS CALC - useEffect on rows/tax change
  useEffect(() => {
    if (rows.length === 0) {
      setRows([{}]);
    }
  }, []);

  useEffect(() => {
    const newTotals = calculateTotals(rows, formData.tax_type, formData.tax_percent || 5)
    setFormData(prev => ({
      ...prev,
      bill_amt: newTotals.billAmt,
      tax_amt: newTotals.taxAmt,
      total_amt: newTotals.totalAmt
    }))
  }, [rows, formData.tax_type, formData.tax_percent])

  const handleFormChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }, [])

  const handleRowChange = useCallback((index, field, value) => {
    const updatedRows = [...rows]
    updatedRows[index][field] = value
    setRows(updatedRows)
  }, [rows])

  const addRow = useCallback((newRow = {}) => {
    setRows(prev => [...prev, newRow])
  }, [])

  const deleteRow = useCallback((index) => {
    if (rows.length > 1) {
      setRows(prev => prev.filter((_, i) => i !== index))
    }
  }, [rows.length])

  // Calculate totals for Tauri command
  // Backend payload totals (keep existing logic)
  const getBackendTotals = () => {
    const totalQty = rows.reduce((sum, item) => sum + (parseFloat(item.qty) || 0), 0)
    const totalWeight = 0
    const totalAmount = rows.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
    
    let baseAmount = totalAmount
    let taxAmount = 0
    if (formData.tax_type === 'Inclusive') {
      baseAmount = totalAmount / 1.05
      taxAmount = totalAmount - baseAmount
    }
    
    const netAmount = formData.tax_type === 'Exclusive' ? totalAmount + taxAmount : totalAmount
    
    return {
      totalQty,
      totalWeight,
      totalAmount,
      baseAmount,
      discAmount: 0,
      taxAmount,
      netAmount,
      deductions: { autoWages: 0, vatPercent: 0, vat: 0 },
      grandTotal: netAmount
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const totals = getBackendTotals()
      // Transform items to match Tauri command format
      const transformedItems = rows.map(item => ({
        itemName: item.item_name,
        lotNo: item.lot_no,
        qty: parseFloat(item.qty) || 0,
        weight: 0,
        totalWt: 0,
        rate: parseFloat(item.rate) || 0,
        disc: parseFloat(item.disc) || 0,
        tax: parseFloat(item.tax_rate) || 0,
        amount: parseFloat(item.amount) || 0
      }))

      const result = await createSale(formData, transformedItems, totals)
      
      if (result.success) {
        setSuccess('Sales created successfully!')
        setFormData({
          bill_no: '', date: new Date().toISOString().split('T')[0], pay_type: 'Credit',
          tax_type: 'Exclusive', type: '', lorry_no: '', p_o_no: '', driver: '',
          pur_trans: '', remarks: '', customer_id: '', address: '', sender_id: '',
          consignee_id: '', godown_from_id: '', bill_amt: 0, tax_amt: 0, total_amt: 0,
          deduction: '', deduction_remarks: ''
        })
        setRows([{ item_name: '', lot_no: '', qty: '', box: '', rate: '', disc: '', tax_rate: '', amount: '' }])
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(result.message || 'Error creating sales')
      }
    } catch (err) {
      setError(err.message || 'Error creating sales')
    } finally {
      setLoading(false)
    }
  }

  // ✅ CORRECTED: EntryTopFrame fields (NO 'value' prop)
  const topFrameFields = [
    // Column 1: Core fields
    { name: 'bill_no', label: 'Bill No', type: 'text' },
    { name: 'date', label: 'Date', type: 'date' },
    { name: 'pay_type', label: 'Pay Type', type: 'select', options: [
      {value: 'Cash', label: 'Cash'},
      {value: 'Credit', label: 'Credit'}
    ] },
    
    // Column 2: Logistics  
    { name: 'lorry_no', label: 'Lorry No', type: 'text' },
    { name: 'p_o_no', label: 'P.O No', type: 'text' },
    { name: 'driver', label: 'Driver', type: 'text' },
    
    // Column 3: Masters + Tax (autofill address/phone)
    { name: 'customer_id', label: 'Customer', type: 'masterSelect', masterType: 'customers' },
    { name: 'address', label: 'Address', readOnly: true },
    { name: 'phone', label: 'Phone', readOnly: true },
    { name: 'godown_from_id', label: 'Godown', type: 'masterSelect', masterType: 'godowns' },
    { name: 'tax_type', label: 'Tax Type', type: 'select', options: [
      {value: 'Exclusive', label: 'Exclusive'},
      {value: 'Inclusive', label: 'Inclusive'}
    ] },
    { name: 'tax_percent', label: 'Tax %', type: 'number' }
  ]

  // ✅ CORRECT COLUMNS for Sales + lotSelect mode (sales consume lots)
const columns = [
    { key: 's_no', title: 'S.No', readOnly: true },
    { key: 'item_name', title: 'Item', type: 'masterSelect', masterType: 'items' },
    { key: 'lot_no', title: 'Lot No', type: 'lotSelect' },
    { key: 'qty', title: 'Qty', type: 'number' },
    { key: 'box', title: 'Box', type: 'number' },
    { key: 'rate', title: 'Rate', type: 'number' },
    { key: 'disc', title: 'Disc%', type: 'number' },
    { key: 'tax_rate', title: 'Tax%', type: 'number' },
    { key: 'amount', title: 'Amount', readOnly: true }
  ]

  // Define totals for EntryTotalsRow
  const totals = [
    { label: 'Total Qty', value: rows.reduce((sum, row) => sum + (parseFloat(row.qty) || 0), 0), isAmount: false },
    { label: 'Bill Amt', value: formData.bill_amt, isAmount: true },
    { label: 'Tax Amt', value: formData.tax_amt, isAmount: true },
    { label: 'Total Amt', value: formData.total_amt, isAmount: true },
  ]

  // Bottom summary fields
  const summaryFields = [
    { name: 'bill_amt', label: 'Bill Amt', value: formData.bill_amt, readOnly: true },
    { name: 'tax_amt', label: 'Tax Amt', value: formData.tax_amt, readOnly: true },
    { name: 'total_amt', label: 'Total Amt', value: formData.total_amt, readOnly: true },
  ]

  const deductionFields = [
    { name: 'deduction', label: 'Deduction', value: formData.deduction },
    { name: 'deduction_remarks', label: 'Remarks', value: formData.deduction_remarks },
  ]

  // Handler for EntryTopFrame
  const handleTopFrameChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (name === 'tax_type') {
      setTimeout(updateTotals, 100)
    }
  }







  return (
    <div className="window">
      {/* SCREEN TITLE - from HTML */}
      <div className="screen-title">Sales Creation</div>

      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}

      <form onSubmit={handleSubmit}>
        {/* MODULAR: EntryTopFrame - 3-column form layout from HTML */}
        <EntryTopFrame 
          fields={topFrameFields} 
          data={formData} 
          onChange={handleFormChange}
          columns={3}
          taxType={formData.tax_type}
          taxRate={formData.tax_percent}
        />

        <EntryItemsTable 
          columns={columns}
          data={rows}
          onRowChange={handleRowChange}
          onAddRow={addRow}
          onDeleteRow={deleteRow}
          showActions={true}
          lotMode="select"
          taxType={formData.tax_type}
          taxRate={formData.tax_percent}
        />

        {/* Live totals */}
        <EntryTotalsRow 
          totals={[
            { label: 'Total Qty', value: rows.reduce((sum, r) => sum + (r.qty || 0), 0) },
            { label: 'Bill Amt', value: formData.bill_amt, isAmount: true },
            { label: 'Tax Amt', value: formData.tax_amt, isAmount: true },
            { label: 'Total', value: formData.total_amt, isAmount: true }
          ]} 
        />

        <EntryTotalsRow 
          totals={[
            { label: 'Total Qty', value: rows.reduce((sum, r) => sum + (parseFloat(r.qty) || 0), 0), isAmount: false },
            { label: 'Bill Amt', value: formData.bill_amt, isAmount: true },
            { label: 'Tax Amt', value: formData.tax_amt, isAmount: true },
            { label: 'Total', value: formData.total_amt, isAmount: true }
          ]} 
        />

        <EntryBottomSummary 
          items={[
            { label: 'Amount', value: formData.bill_amt, isAmount: true },
            { label: 'Tax', value: formData.tax_amt, isAmount: true },
            { label: 'Net Total', value: formData.total_amt, isAmount: true }
          ]}
          deductionFields={deductionFields}
          formData={formData}
          onChange={handleFormChange}
        />

        {/* MODULAR: EntryActions - Save button from HTML */}
        <EntryActions 
          onSave={handleSubmit}
          loading={loading}
          saveText="Save Sales"
        />
      </form>
    </div>
  )
}

export default SalesCreate
