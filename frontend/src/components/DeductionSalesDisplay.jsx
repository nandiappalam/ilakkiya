import React, { useState, useEffect, useRef } from 'react'
import api from '../utils/api.js'
import MasterTableLayout from './master/MasterTableLayout'

const DeductionSalesDisplay = () => {
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
      const result = await api.getDeductionSales()
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
      const result = await api.deleteMaster('deduction_sales_master', deduction.id)
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
      <p><b>Adjust with Sales:</b> ${deduction.adjust_with_sales}</p>
      <p><b>Account Head:</b> ${deduction.account_head}</p>
      <p><b>Deduction Type:</b> ${deduction.ded_type}</p>
      <p><b>Calc Type:</b> ${deduction.calc_type}</p>
      <p><b>Deduction Value:</b> ${deduction.ded_value}</p>
      <p><b>Status:</b> ${deduction.status}</p>
      </body></html>
    `)
    printWindow.print()
  }

  const columns = [
    { key: 'sno', title: 'S.No', width: '50px', render: (_, __, index) => index + 1 },
    { key: 'ded_name', title: 'Deduction Name' },
    { key: 'adjust_with_sales', title: 'Adjust with Sales' },
    { key: 'account_head', title: 'Account Head' },
    { key: 'ded_type', title: 'Add/Subtract' },
    { key: 'calc_type', title: 'Amount/Percent' },
    { key: 'ded_value', title: 'Value' },
    { key: 'status', title: 'Status', width: '80px' },
  ]

  return (
    <MasterTableLayout
      title="SALES DEDUCTION MASTER"
      columns={columns}
      data={deductions}
      onEdit={handleUpdate}
      onDelete={handleDelete}
      showActions={true}
    />
  )
}

export default DeductionSalesDisplay
