import React, { useState, useEffect, useRef } from 'react'
import api from '../utils/api.js'
import MasterTableLayout from './master/MasterTableLayout'

const DeductionPurchaseDisplay = () => {
  const [deductions, setDeductions] = useState([])
  const [loading, setLoading] = useState(true)

  const hasFetched = useRef(false);
  
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchDeductions()
  }, [])

  const fetchDeductions = async () => {
    try {
      const result = await api.getDeductionPurchase()
      if (result.success) {
        setDeductions(result.data)
      } else {
        console.error('Error fetching deductions:', result.message)
      }
    } catch (error) {
      console.error('Error fetching deductions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (deduction) => {
    if (!window.confirm('Are you sure you want to delete this deduction?')) return

    try {
      const result = await api.deleteMaster('deduction_purchase_master', deduction.id)
      if (result.success) {
        alert('Deduction deleted successfully')
        fetchDeductions()
      } else {
        alert('Error deleting deduction: ' + result.message)
      }
    } catch (error) {
      alert('Error deleting deduction')
      console.error('Error deleting deduction:', error)
    }
  }

  const handleUpdate = (deduction) => {
    alert('Update functionality - Deduction ID: ' + deduction.id)
  }

  const handlePrint = (deduction) => {
    const printWindow = window.open('', '', 'width=800,height=600')
    printWindow.document.write(`
      <html><head><title>Deduction</title></head><body>
      <h3>Deduction Details</h3>
      <p><b>Deduction Name:</b> ${deduction.ded_name}</p>
      <p><b>Debit Adjust:</b> ${deduction.debit_adjust}</p>
      <p><b>Account Head:</b> ${deduction.account_head}</p>
      <p><b>Credit Adjust:</b> ${deduction.credit_adjust}</p>
      <p><b>Deduction Type:</b> ${deduction.ded_type}</p>
      <p><b>Status:</b> ${deduction.status}</p>
      </body></html>
    `)
    printWindow.print()
  }

  const columns = [
    { key: 'sno', title: 'S.No', width: '50px', render: (_, __, index) => index + 1 },
    { key: 'ded_name', title: 'Deduction Name' },
    { key: 'debit_adjust', title: 'Debit Adjust' },
    { key: 'account_head', title: 'Account Head' },
    { key: 'credit_adjust', title: 'Credit Adjust' },
    { key: 'ded_type', title: 'Ded Type' },
    { key: 'status', title: 'Status', width: '80px' },
  ]

  return (
    <MasterTableLayout
      title="PURCHASE DEDUCTION MASTER"
      columns={columns}
      data={deductions}
      onEdit={handleUpdate}
      onDelete={handleDelete}
      showActions={true}
    />
  )
}

export default DeductionPurchaseDisplay
