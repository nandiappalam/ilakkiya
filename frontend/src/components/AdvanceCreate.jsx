import React, { useState } from 'react'
import './AdvanceCreate.css'
import api from "../config/api";
// Import modular entry components
import { EntryTopFrame, EntryActions } from './entry'

/**
 * AdvanceCreate - Advance Creation Entry Page
 * 
 * STRUCTURE from Entry/advance C.html:
 * - Centered panel layout (width: 620px, margin: 80px auto)
 * - Fields: S.No, Date, Papad Company, Amount (with Dr/Cr), Pay Mode, Remarks
 * - Save button at bottom right
 */
const AdvanceCreate = () => {
  const [formData, setFormData] = useState({
    s_no: '',
    date: new Date().toISOString().split('T')[0],
    papad_company: '',
    amount: '',
    dr_cr: 'Dr',
    pay_mode: '',
    remarks: ''
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      // Map frontend field names to backend expected names
      const postData = {
        s_no: formData.s_no,
        date: formData.date,
        papad_company: formData.papad_company || formData.papad_company_id,
        amount: formData.amount,
        dr_cr: formData.dr_cr,
        pay_mode: formData.pay_mode,
        remarks: formData.remarks
      }
      
      // Use Tauri API instead of fetch
      const result = await api.createAdvance(postData);
      
      if (result && result.success) {
        setMessage('Advance saved successfully')
        setMessageType('success')
        setFormData({
          s_no: '', date: new Date().toISOString().split('T')[0],
          papad_company: '', amount: '', dr_cr: 'Dr', pay_mode: '', remarks: ''
        })
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage(result?.message || 'Error saving advance')
        setMessageType('error')
      }
    } catch (error) {
      console.error('Error saving advance:', error);
      setMessage('Error: ' + error.message)
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  // Define fields for EntryTopFrame - organized by columns
  const topFrameFields = [
    // Column 1
    { name: 's_no', label: 'S.No', type: 'text', value: formData.s_no },
    { name: 'date', label: 'Date', type: 'date', value: formData.date },
    { name: 'papad_company_id', label: 'Papad Company', masterType: 'papad_companies', value: formData.papad_company_id },
    // Column 2
    { name: 'amount', label: 'Amount', type: 'text', value: formData.amount },
    { name: 'dr_cr', label: 'Dr/Cr', type: 'text', value: formData.dr_cr },
    { name: 'pay_mode', label: 'Pay Mode', type: 'text', value: formData.pay_mode },
    // Column 3
    { name: 'remarks', label: 'Remarks', type: 'text', value: formData.remarks },
  ]

  return (
    <div className="window">
      {/* TITLE - using modular component style */}
      <div className="screen-title">Advance Creation</div>

      {message && <div className={`message ${messageType}`}>{message}</div>}

      <form onSubmit={handleSubmit}>
        {/* Using modular EntryTopFrame component */}
        <EntryTopFrame 
          fields={topFrameFields} 
          data={formData} 
          onChange={handleChange}
        />

        {/* Using modular EntryActions component */}
        <EntryActions 
          onSave={handleSubmit}
          loading={loading}
          saveText="Save"
        />
      </form>
    </div>
  )
}

export default AdvanceCreate
