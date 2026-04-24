import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import MasterTableLayout from './master/MasterTableLayout'
import { getMasters, deleteMaster } from '../services/masterservice'


const SupplierDisplay = () => {
  const [suppliers, setSuppliers] = useState([])
  const hasFetched = useRef(false);
  const navigate = useNavigate()

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    loadSuppliers()
  }, [])

  const loadSuppliers = async () => {
    try {
const result = await getMasters("suppliers")
      setSuppliers(result.data || [])
    } catch (error) {
      console.error('Error loading suppliers:', error)
      setSuppliers([])
    } finally {
      setLoading(false)
    }
  }


  const handleDelete = async (supplier) => {
    if (!window.confirm('Are you sure you want to delete this supplier?')) return
    try {
await deleteMaster("supplier_master", supplier.id)
      loadSuppliers()
    } catch (error) {
      console.error('Error deleting supplier:', error)
    }
  }


  const handleUpdate = (supplier) => {
    navigate(`/supplier-update?id=${supplier.id}`)
  }

  const handlePrint = (supplier) => {
    const printWindow = window.open('', '_blank', 'width=600,height=400')
    printWindow.document.write(`
      <html>
        <head>
          <title>Supplier Details - ${supplier.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { color: #333; }
            table { width: 100%; border-collapse: collapse; }
            td { padding: 8px; border-bottom: 1px solid #ddd; }
            label { font-weight: bold; }
          </style>
        </head>
        <body>
          <h2>Supplier Details</h2>
          <table>
            <tr><td><label>Supplier Name:</label></td><td>${supplier.name || ''}</td></tr>
            <tr><td><label>Print Name:</label></td><td>${supplier.print_name || ''}</td></tr>
            <tr><td><label>Contact Person:</label></td><td>${supplier.contact_person || ''}</td></tr>
            <tr><td><label>Address:</label></td><td>${supplier.address1 || ''}</td></tr>
            <tr><td><label>Area:</label></td><td>${supplier.area || ''}</td></tr>
            <tr><td><label>Mobile:</label></td><td>${supplier.mobile1 || ''}</td></tr>
            <tr><td><label>GST Number:</label></td><td>${supplier.gst_number || ''}</td></tr>
            <tr><td><label>Opening Balance:</label></td><td>${supplier.opening_balance || 0}</td></tr>
            <tr><td><label>Status:</label></td><td>${supplier.status || 'Active'}</td></tr>
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
    { key: 'name', title: 'Supplier Name' },
    { key: 'mobile', title: 'Mobile' },
    { key: 'area', title: 'Area' },
    { key: 'gst_no', title: 'GST No' },
    { key: 'opening_balance', title: 'Balance' },
    { key: 'status', title: 'Status', width: '80px' },
  ]

  return (
    <MasterTableLayout
      title="SUPPLIER MASTER"
      columns={columns}
      data={suppliers}
      onEdit={handleUpdate}
      onDelete={handleDelete}
      showActions={true}
    />
  )
}

export default SupplierDisplay
