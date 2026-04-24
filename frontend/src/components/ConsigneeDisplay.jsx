import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMasters, deleteMaster } from '../services/masterservice'
import MasterTableLayout from './master/MasterTableLayout'

const ConsigneeDisplay = () => {
  const [consignees, setConsignees] = useState([])

  const hasFetched = useRef(false);
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadConsignees()
  }, [])

  const loadConsignees = async () => {
    try {
const result = await getMasters('consignees')
      if (result.success) {
        setConsignees(result.data)
      } else {
        console.error('Error loading consignees:', result.message)
      }
    } catch (error) {
      console.error('Error loading consignees:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (consignee) => {
    if (!confirm('Are you sure you want to delete this consignee?')) return

    try {
const result = await deleteMaster('consignee_group_master', consignee.id)
      if (result.success) {
        alert('Consignee deleted successfully')
        loadConsignees()
      } else {
        alert('Error deleting consignee: ' + result.message)
      }
    } catch (error) {
      alert('Error deleting consignee: ' + error.message)
    }
  }

  const handleUpdate = (consignee) => {
    navigate(`/consignee-update?id=${consignee.id}`)
  }

  const handlePrint = (consignee) => {
    const printWindow = window.open('', '_blank', 'width=600,height=400')
    printWindow.document.write(`
      <html>
        <head>
          <title>Consignee Details - ${consignee.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { color: #333; }
            table { width: 100%; border-collapse: collapse; }
            td { padding: 8px; border-bottom: 1px solid #ddd; }
            label { font-weight: bold; }
          </style>
        </head>
        <body>
          <h2>Consignee Details</h2>
          <table>
            <tr><td><label>Name:</label></td><td>${consignee.name || ''}</td></tr>
            <tr><td><label>Print Name:</label></td><td>${consignee.print_name || ''}</td></tr>
            <tr><td><label>Contact Person:</label></td><td>${consignee.contact_person || ''}</td></tr>
            <tr><td><label>Address:</label></td><td>${consignee.address1 || ''}</td></tr>
            <tr><td><label>Area:</label></td><td>${consignee.area || ''}</td></tr>
            <tr><td><label>Mobile:</label></td><td>${consignee.mobile1 || ''}</td></tr>
            <tr><td><label>Status:</label></td><td>${consignee.status || ''}</td></tr>
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
    { key: 'sno', title: 'S.No', width: '50px', render: (_, __, index) => index + 1 },
    { key: 'name', title: 'Name' },
    { key: 'print_name', title: 'Print Name' },
    { key: 'contact_person', title: 'Contact Person' },
    { key: 'area', title: 'Area' },
    { key: 'mobile1', title: 'Mobile' },
    { key: 'status', title: 'Status', width: '80px' },
  ]

  return (
    <MasterTableLayout
      title="CONSIGNEE MASTER"
      columns={columns}
      data={consignees}
      onEdit={handleUpdate}
      onDelete={handleDelete}
      showActions={true}
    />
  )
}

export default ConsigneeDisplay
