import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMasters, deleteMaster } from '../services/masterservice.js';
import MasterTableLayout from './master/MasterTableLayout'

const PapadCompanyDisplay = () => {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    loadCompanies()
  }, [])

  const loadCompanies = async () => {
    try {
      const result = await getMasters('papad_companies')
      if (result.success) {
        setCompanies(result.data)
      } else {
        console.error('Error loading companies:', result.message)
      }
    } catch (error) {
      console.error('Error loading companies:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (company) => {
    if (!confirm('Are you sure you want to delete this company?')) return

    try {
      const result = await deleteMaster('papad_companies', company.id)
      if (result.success) {
        alert('Company deleted successfully')
        loadCompanies()
      } else {
        alert('Error deleting company: ' + result.message)
      }
    } catch (error) {
      alert('Error deleting company: ' + error.message)
    }
  }

  const handleUpdate = (company) => {
    navigate(`/papad-company-update?id=${company.id}`)
  }

  const handlePrint = (company) => {
    const printWindow = window.open('', '_blank', 'width=600,height=400')
    printWindow.document.write(`
      <html>
        <head>
          <title>Papad Company Details</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; }
            td { padding: 5px; border-bottom: 1px solid #ddd; }
            label { font-weight: bold; }
          </style>
        </head>
        <body>
          <h2>Papad Company Details</h2>
          <table>
            <tr><td><label>Name:</label></td><td>${company.name || ''}</td></tr>
            <tr><td><label>Print Name:</label></td><td>${company.print_name || ''}</td></tr>
            <tr><td><label>Contact Person:</label></td><td>${company.contact_person || ''}</td></tr>
            <tr><td><label>Area:</label></td><td>${company.area || ''}</td></tr>
            <tr><td><label>Mobile 1:</label></td><td>${company.mobile1 || ''}</td></tr>
            <tr><td><label>GST No:</label></td><td>${company.gst_no || ''}</td></tr>
            <tr><td><label>Opening Balance:</label></td><td>${company.opening_balance || 0}</td></tr>
          </table>
          <script>window.onload=function(){window.print();window.close();}</script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  const columns = [
    { key: 'sno', title: 'S.No', width: '50px', render: (_, __, index) => index + 1 },
    { key: 'name', title: 'Name' },
    { key: 'print_name', title: 'Print Name' },
    { key: 'contact_person', title: 'Contact Person' },
    { key: 'area', title: 'Area' },
    { key: 'mobile1', title: 'Mobile 1' },
    { key: 'opening_balance', title: 'Opening Balance' },
  ]

  return (
    <MasterTableLayout
      title="PAPAD COMPANY MASTER"
      columns={columns}
      data={companies}
      onEdit={handleUpdate}
      onDelete={handleDelete}
      showActions={true}
    />
  )
}

export default PapadCompanyDisplay
