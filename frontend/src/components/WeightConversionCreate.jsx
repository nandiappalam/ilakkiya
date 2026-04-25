import React, { useState } from 'react'
import axios from 'axios'
import './WeightConversionCreate.css'

// Import modular entry components
import { EntryTopFrame, EntryItemsTable, EntryActions, EntrySection } from './entry'

const WeightConversionCreate = () => {
  const [formData, setFormData] = useState({
    sNo: '',
    date: '',
    remarks: '',
    type: ''
  })

  const [items, setItems] = useState([
    { item_name: '', lot_no: '', weight: '', qty: '', total_wt: '' }
    //{ item_name: '', lot_no: '', weight: '', qty: '', total_wt: '' },
   // { item_name: '', lot_no: '', weight: '', qty: '', total_wt: '' }
  ])

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('success')

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleItemChange = (index, field, value) => {
    setItems(prevItems => {
      const updatedItems = [...prevItems]
      if (field === '__batch__' && typeof value === 'object') {
        updatedItems[index] = { ...updatedItems[index], ...value }
      } else {
        updatedItems[index] = { ...updatedItems[index], [field]: value }
      }

      // Auto-calculate total weight if weight and qty are provided
      if (field === 'weight' || field === 'qty' || (field === '__batch__' && ('weight' in value || 'qty' in value))) {
        const weight = parseFloat(updatedItems[index].weight) || 0
        const qty = parseFloat(updatedItems[index].qty) || 0
        updatedItems[index].total_wt = (weight * qty).toFixed(2)
      }

      return updatedItems
    })
  }

  const addItemRow = () => {
    setItems(prev => [...prev, { item_name: '', lot_no: '', weight: '', qty: '', total_wt: '' }])
  }

  const removeItemRow = (index) => {
    setItems(prev => {
      if (prev.length <= 1) return prev
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.date) {
      setMessage('Date is required')
      setMessageType('error')
      return
    }

    const validItems = items.filter(item => item.item_name.trim() && item.qty > 0)
    if (validItems.length === 0) {
      setMessage('At least one item with name and quantity is required')
      setMessageType('error')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const payload = {
        formData: {
          sNo: formData.sNo || null,
          date: formData.date,
          remarks: formData.remarks,
          type: formData.type
        },
        items: validItems
      }

      const response = await axios.post('/api/weight-conversion', payload)

      if (response.status === 201) {
        setMessage('Weight conversion saved successfully!')
        setMessageType('success')
        setFormData({ sNo: '', date: '', remarks: '', type: '' })
        setItems([
          { item_name: '', lot_no: '', weight: '', qty: '', total_wt: '' },
          { item_name: '', lot_no: '', weight: '', qty: '', total_wt: '' },
          { item_name: '', lot_no: '', weight: '', qty: '', total_wt: '' }
        ])
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      setMessage('Error saving weight conversion: ' + (error.response?.data?.message || error.message))
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const topFrameFields = [
    { name: 'sNo', label: 'S.No', type: 'number', value: formData.sNo },
    { name: 'date', label: 'Date', type: 'date', value: formData.date },
    { name: 'remarks', label: 'Remarks', value: formData.remarks },
    { name: 'type', label: 'Type', value: formData.type },
  ]

  const itemColumns = [
    { key: 'sno', title: 'S.No', width: '30px', render: (_, __, index) => index + 1 },
    { key: 'item_name', title: 'Item Name', type: 'masterSelect', masterType: 'items' },
    { key: 'lot_no', title: 'Lot No', type: 'lotSelect' },
    { key: 'weight', title: 'Weight', type: 'number' },
    { key: 'qty', title: 'Qty', type: 'number' },
    { key: 'total_wt', title: 'Tot Wt', type: 'number' },
  ]

  const handleRowChange = (rowIndex, key, value) => {
    handleItemChange(rowIndex, key, value)
  }

  return (
    <div className="window">
      <div className="screen-title">Weight Conversion Creation</div>

      {message && <div className={`message ${messageType}`}>{message}</div>}

      <EntryTopFrame 
        fields={topFrameFields} 
        data={formData} 
        onChange={handleFormChange}
      />

      <EntrySection title="Items">
        <EntryItemsTable 
          columns={itemColumns}
          data={items}
          onRowChange={handleRowChange}
          onAddRow={addItemRow}
          onDeleteRow={removeItemRow}
          showActions={true}
          lotMode="select"
        />
      </EntrySection>

      <EntryActions 
        onSave={handleSubmit}
        saving={loading}
        saveText="Save"
      />
    </div>
  )
}

export default WeightConversionCreate
