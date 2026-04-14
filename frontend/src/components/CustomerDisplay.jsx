import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import './customer-display.css'

const CustomerDisplay = () => {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)

  const hasFetched = useRef(false);
  const navigate = useNavigate()

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    try {
      const result = await api.getCustomers()
      if (result.success) {
        // console.log('Customers loaded:', result.data)
        setCustomers(result.data || [])
      } else {
        console.error('Failed to fetch customers:', result.message)
        setCustomers([])
      }
    } catch (error) {
      console.error('Error loading customers:', error)
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (customer) => {
    if (!confirm('Are you sure you want to delete this customer?')) return

    try {
      const result = await api.deleteCustomer(customer.id)
      if (result.success) {
        alert('Customer deleted successfully')
        loadCustomers()
      } else {
        alert('Error deleting customer: ' + result.message)
      }
    } catch (error) {
      alert('Error deleting customer: ' + error.message)
    }
  }

  const handleUpdate = (customer) => {
    navigate(`/customer-update?id=${customer.id}`)
  }

  const handlePrint = (customer) => {
    const printWindow = window.open('', '_blank', 'width=600,height=400')
    printWindow.document.write(`
      <html>
        <head>
          <title>Customer Details - ${customer.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { color: #333; }
            table { width: 100%; border-collapse: collapse; }
            td { padding: 8px; border-bottom: 1px solid #ddd; }
            label { font-weight: bold; }
          </style>
        </head>
        <body>
          <h2>Customer Details</h2>
          <table>
            <tr><td><label>Name:</label></td><td>${customer.name || ''}</td></tr>
            <tr><td><label>Print Name:</label></td><td>${customer.print_name || ''}</td></tr>
            <tr><td><label>Contact Person:</label></td><td>${customer.contact_person || ''}</td></tr>
            <tr><td><label>Address:</label></td><td>${customer.address1 || ''}</td></tr>
            <tr><td><label>Area:</label></td><td>${customer.area || ''}</td></tr>
            <tr><td><label>Mobile:</label></td><td>${customer.mobile1 || ''}</td></tr>
            <tr><td><label>GST Number:</label></td><td>${customer.gst_number || ''}</td></tr>
            <tr><td><label>Opening Balance:</label></td><td>${customer.opening_balance || 0}</td></tr>
            <tr><td><label>Status:</label></td><td>${customer.status || 'Active'}</td></tr>
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

  // Columns matching task spec
  const columns = [
    { key: 'sno', title: 'S.No', width: '60px', render: (_,__,index) => index+1 },
    { key: 'name', title: 'Customer Name' },
    { key: 'mobile', title: 'Mobile' }, // mobile1/2 combined or use mobile
    { key: 'area', title: 'Area' },
    { key: 'gst_no', title: 'GST No' },
    { key: 'limit_amount', title: 'Limit Amount' },
    { key: 'status', title: 'Status', width: '80px' },
  ]

  if (loading) {
    return (
      <div className="standard-display">
        <div className="screen-title">CUSTOMER MASTER</div>
        <div className="container">
          <p style={{ textAlign: 'center', padding: '30px' }}>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="standard-display">
      <div className="screen-title">
        CUSTOMER MASTER
      </div>
      
      <div className="container">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col.key} style={col.width ? { width: col.width } : {}}>
                    {col.title}
                  </th>
                ))}
                <th className="actions-header" style={{ width: '240px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: '30px' }}>
                    No records found
                  </td>
                </tr>
              ) : (
                customers.map((row, index) => (
                  <tr key={row.id || index}>
                    {columns.map((col) => (
                      <td key={col.key}>
                        {col.key === 'sno' ? index + 1 : row[col.key]}
                      </td>
                    ))}
                    <td className="actions-cell">
                      <button onClick={() => handlePrint(row)} className="action-btn print-btn">Print</button>
                      <button onClick={() => handleUpdate(row)} className="action-btn update-btn">Update</button>
                      <button onClick={() => handleDelete(row)} className="action-btn delete-btn">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="footer-bar">
        Total Records: {customers.length}
      </div>
    </div>
  )
}

export default CustomerDisplay
