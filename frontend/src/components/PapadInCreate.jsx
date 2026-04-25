import React, { useState, useEffect, useCallback } from 'react'
import './PapadInCreate.css'

// Import ALL modular components from entry folder
import { 
  EntryTopFrame, 
  EntryItemsTable, 
  EntryTotalsRow, 
  EntryBottomSummary, 
  EntryActions 
} from './entry';

const PapadInCreate = () => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 10),
    wt_scale: 'No',
    remarks: '',
    papad_company: '',
  })

  const [rows, setRows] = useState([{}])

  const topFrameFields = [
    { name: 'date', label: 'Date', type: 'date' },
    { name: 'wt_scale', label: 'Wt Scale', type: 'select', options: [
      {value: 'Yes', label: 'Yes'},
      {value: 'No', label: 'No'}
    ] },
    { name: 'papad_company_id', label: 'Papad Company', type: 'masterSelect', masterType: 'papad_companies' },
    { name: 'remarks', label: 'Remarks', type: 'text' }
  ]

  const unifiedColumns = [
    { key: 's_no', title: 'S.No', readOnly: true },
    { key: 'item_name', title: 'Item Name', type: 'masterSelect', masterType: 'items' },
    { key: 'lot_no', title: 'Lot No', type: 'text', readOnly: true },
    { key: 'box_papad', title: 'Box (Papad)' },
    { key: 'wt_papad', title: 'Wt (Papad)' },
    { key: 'box_empty', title: 'Box (Empty)' },
    { key: 'wt_empty', title: 'Wt (Empty)' },
    { key: 'tot_wt', title: 'Tot Wt' },
    { key: 'kg', title: 'Kg' }
  ];

  const handleFieldChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleRowChange = useCallback((index, field, value) => {
    setRows(prevRows => {
      const newRows = [...prevRows]
      if (field === '__batch__' && typeof value === 'object') {
        newRows[index] = { ...newRows[index], ...value }
      } else {
        newRows[index] = { ...newRows[index], [field]: value }
      }
      return newRows
    })
  }, [])

  const addRow = useCallback((newRow = {}) => {
    setRows(prev => [...prev, newRow])
  }, [])

  const deleteRow = useCallback((index) => {
    setRows(prev => {
      if (prev.length <= 1) return prev
      return prev.filter((_, i) => i !== index)
    })
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Papad In Data:', {
      header: formData,
      rows
    })
    // TODO: Submit to API
  }

  return (
    <div className="window">
      <div className="window-header">
        <span>Papad In Creation</span>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Top Frame - 3 Column Info Bar */}
        <EntryTopFrame 
          fields={topFrameFields}
          data={formData}
          onChange={handleFieldChange}
        />

        {/* Unified Papad & Flour Items - LOT Creation */}
        <EntryItemsTable
          columns={unifiedColumns}
          data={rows}
          onRowChange={handleRowChange}
          onAddRow={addRow}
          onDeleteRow={deleteRow}
          showActions={true}
          lotMode="auto"
        />

        <EntryTotalsRow totals={[]} />
        <EntryBottomSummary />

        {/* Action Buttons */}
        <EntryActions 
          onSave={handleSubmit}
          showSave={true}
          saveText="Save"
        />
      </form>
    </div>
  )
}

export default PapadInCreate
