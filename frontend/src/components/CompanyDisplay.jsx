import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import MasterTableLayout from './master/MasterTableLayout'
import api from '../utils/api.js'


const CompanyDisplay = () => {
  const [companies, setCompanies] = useState([])
  const hasFetched = useRef(false);
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    loadCompanies()
  }, [])

  const loadCompanies = async () => {
    setLoading(true)
    try {
      const result = await api.getMasters("companies")
      setCompanies(result.data || [])
    } catch (error) {
      console.error('Error loading companies:', error)
      setCompanies([])
    } finally {
      setLoading(false)
    }
  }


  const handleDelete = async (company) => {
    if (!window.confirm('Are you sure you want to delete this company?')) return
    try {
      await api.deleteMaster("companies", company.id)
      loadCompanies()
    } catch (error) {
      console.error('Error deleting company:', error)
    }
  }


  const handleOpen = (company) => {
    // Navigate to auth choice page with the selected company
    navigate('/auth-choice', { state: { company } })
  }

  const handleUpdate = (company) => {
    navigate(`/company-update?id=${company.id}`)
  }

  const handlePrint = (company) => {
    const printWindow = window.open('', '_blank', 'width=600,height=400')
    printWindow.document.write(`
      <html>
        <head>
          <title>Company Details - ${company.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { color: #333; }
            table { width: 100%; border-collapse: collapse; }
            td { padding: 8px; border-bottom: 1px solid #ddd; }
            label { font-weight: bold; }
          </style>
        </head>
        <body>
          <h2>Company Details</h2>
          <table>
            <tr><td><label>Company Name:</label></td><td>${company.name || ''}</td></tr>
            <tr><td><label>Address:</label></td><td>${company.address || ''}</td></tr>
            <tr><td><label>GST Number:</label></td><td>${company.gst_number || ''}</td></tr>
            <tr><td><label>Contact:</label></td><td>${company.contact || ''}</td></tr>
            <tr><td><label>Email:</label></td><td>${company.email || ''}</td></tr>
          </table>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  const columns = [
    { key: 'sno', title: 'S.No', width: '60px', render: (_, __, index) => index + 1 },
    { key: 'name', title: 'Company Name' },
    { key: 'address', title: 'Address' },
    { key: 'gst_number', title: 'GST Number' },
    { key: 'contact', title: 'Contact' },
    { key: 'email', title: 'Email' },
  ]

  return (
    <MasterTableLayout
      title="COMPANY MASTER"
      columns={columns}
      data={companies}
      onOpen={handleOpen}
      onEdit={handleUpdate}
      onDelete={handleDelete}
      onPrint={handlePrint}
      showActions={true}
    />
  )
}

export default CompanyDisplay
