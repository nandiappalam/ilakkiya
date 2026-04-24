import React, { useState } from 'react'
import api from '../services/api.js'
import './SalesCreate.css'

// Import modular components from entry folder
import { EntryTopFrame, EntryItemsTable, EntryTotalsRow, EntryBottomSummary, EntryActions } from './entry'

/**
 * PurchaseCreation - Purchase Creation Entry Page
 * Matches SalesCreate format exactly (3-column layout)
 */
const PurchaseCreation = () => {
  const [formData, setFormData] = useState({
    bill_no: '',
    date: new Date().toISOString().split('T')[0],
    pay_type: 'Credit',
    tax_type: 'Exclusive',
    type: '',
    lorry_no: '',
    p_o_no: '',
    driver: '',
    pur_trans: '',
    remarks: '',
    customer: '',
    address: '',
    sender: '',
    consigned_to: '',
    godown_from: '',
    bill_amt: 0,
    tax_amt: 0,
    total_amt: 0,
    deduction: '',
    deduction_remarks: '',
    // Purchase specific fields
    supplier: '',
    inv_no: '',
    inv_date: '',
    godown: ''
  })

  const [items, setItems] = useState([
    { item_name: '', lot_no: '', qty: '', weight: '', box: '', rate: '', disc: '', tax: '', amount: '' }
  ])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Handler for EntryTopFrame - matches SalesCreate
  const handleTopFrameChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleItemChange = (index, key, value) => {
    const newItems = [...items]
    newItems[index][key] = value
    setItems(newItems)
  }

  const addItemRow = () => {
    setItems([...items, { item_name: '', lot_no: '', qty: '', weight: '', box: '', rate: '', disc: '', tax: '', amount: '' }])
  }

  const deleteItemRow = (index) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index)
      setItems(newItems)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const result = await api('/purchases', { method: 'POST', body: { formData, items, totals: { bill_amt: formData.bill_amt, tax_amt: formData.tax_amt, total_amt: formData.total_amt, deduction: formData.deduction } } });
      
      if (!result) {
        console.error("❌ API failed (null response)");
        setError('API failed (null response)');
        return;
      }
      if (result.success) {
        setSuccess('Purchase created successfully!')

        setFormData({
          bill_no: '', date: new Date().toISOString().split('T')[0], pay_type: 'Credit',
          tax_type: 'Exclusive', type: '', lorry_no: '', p_o_no: '', driver: '',
          pur_trans: '', remarks: '', customer: '', address: '', sender: '',
          consigned_to: '', godown_from: '', bill_amt: 0, tax_amt: 0, total_amt: 0,
          deduction: '', deduction_remarks: '', supplier: '', inv_no: '', inv_date: '', godown: ''
        })
        setItems([{ item_name: '', lot_no: '', qty: '', weight: '', box: '', rate: '', disc: '', tax: '', amount: '' }])
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Error creating purchase')
      }
    } catch (err) {
      setError(err.message || 'Error creating purchase')
    } finally {
      setLoading(false)
    }
  }

  // Define fields for EntryTopFrame - organized by columns (matches SalesCreate)
  const topFrameFields = [
    // Column 1
    { name: 'bill_no', label: 'Bill No', type: 'text', value: formData.bill_no },
    { name: 'date', label: 'Date', type: 'date', value: formData.date },
    { name: 'pay_type', label: 'Pay Type', type: 'text', value: formData.pay_type },
    { name: 'tax_type', label: 'Tax Type', type: 'text', value: formData.tax_type },
    { name: 'type', label: 'Type', type: 'text', value: formData.type },
    // Column 2 - Purchase specific fields
    { name: 'supplier', label: 'Supplier', type: 'masterSelect', masterType: 'suppliers', value: formData.supplier },
    { name: 'inv_no', label: 'Inv No', type: 'text', value: formData.inv_no },
    { name: 'inv_date', label: 'Inv Date', type: 'date', value: formData.inv_date },
    { name: 'godown', label: 'Godown', type: 'text', value: formData.godown },
    { name: 'remarks', label: 'Remarks', type: 'text', value: formData.remarks },
    // Column 3
    { name: 'address', label: 'Address', type: 'text', value: formData.address },
    { name: 'lorry_no', label: 'Lorry No', type: 'text', value: formData.lorry_no },
    { name: 'driver', label: 'Driver', type: 'text', value: formData.driver },
    { name: 'pur_trans', label: 'Pur. Trans', type: 'text', value: formData.pur_trans },
    { name: 'p_o_no', label: 'P.O No', type: 'text', value: formData.p_o_no },
  ]

  // Define columns for EntryItemsTable - matches SalesCreate with additional Weight column
  // Note: item_name uses 'masterSelect' to fetch from items master
  // For Purchase: lot_no is auto-generated (read-only)
  const itemColumns = [
    { key: 'item_name', title: 'Item Name', type: 'masterSelect', masterType: 'items' },
    { key: 'lot_no', title: 'Lot No', type: 'text', readOnly: true, placeholder: 'Auto-generated' },
    { key: 'qty', title: 'Qty', type: 'number' },
    { key: 'weight', title: 'Weight', type: 'number' },
    { key: 'box', title: 'Box', type: 'text' },
    { key: 'rate', title: 'Rate', type: 'number' },
    { key: 'disc', title: 'Disc %', type: 'number' },
    { key: 'tax', title: 'Tax %', type: 'number' },
    { key: 'amount', title: 'Amount', type: 'number' },
  ]

  // Define totals for EntryTotalsRow - matches SalesCreate
  const totals = [
    { label: 'Total Qty', value: items.reduce((sum, item) => sum + (parseFloat(item.qty) || 0), 0), isAmount: false },
    { label: 'Bill Amt', value: formData.bill_amt, isAmount: true },
    { label: 'Tax Amt', value: formData.tax_amt, isAmount: true },
    { label: 'Total Amt', value: formData.total_amt, isAmount: true },
  ]

  // Bottom summary fields - matches SalesCreate
  const summaryFields = [
    { name: 'bill_amt', label: 'Bill Amt', value: formData.bill_amt, readOnly: true },
    { name: 'tax_amt', label: 'Tax Amt', value: formData.tax_amt, readOnly: true },
    { name: 'total_amt', label: 'Total Amt', value: formData.total_amt, readOnly: true },
  ]

  const deductionFields = [
    { name: 'deduction', label: 'Deduction', value: formData.deduction },
    { name: 'deduction_remarks', label: 'Remarks', value: formData.deduction_remarks },
  ]

  return (
    <div className="window">
      {/* SCREEN TITLE - matches SalesCreate */}
      <div className="screen-title">Purchase Creation</div>

      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}

      <form onSubmit={handleSubmit}>
        {/* MODULAR: EntryTopFrame - 3-column form layout - matches SalesCreate */}
        <EntryTopFrame 
          fields={topFrameFields} 
          data={formData} 
          onChange={handleTopFrameChange}
          columns={3}
        />

        {/* MODULAR: EntryItemsTable - Items grid - matches SalesCreate */}
        <EntryItemsTable 
          columns={itemColumns}
          data={items}
          onRowChange={handleItemChange}
          onAddRow={addItemRow}
          onDeleteRow={deleteItemRow}
          showActions={true}
          lotMode="auto"
          sectionTitle=""
        />

        {/* MODULAR: EntryTotalsRow - Totals display - matches SalesCreate */}
        <EntryTotalsRow totals={totals} />

        {/* MODULAR: EntryBottomSummary - Summary section - matches SalesCreate */}
        <EntryBottomSummary 
          summaryFields={summaryFields}
          deductionFields={deductionFields}
          formData={formData}
          onChange={handleInputChange}
        />

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

