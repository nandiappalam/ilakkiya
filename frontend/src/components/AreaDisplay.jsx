import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api.js'
import MasterTableLayout from './master/MasterTableLayout'


const AreaDisplay = () => {
  const [areas, setAreas] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const hasFetched = useRef(false);
  const navigate = useNavigate()

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    loadAreas()
  }, [])

  const loadAreas = async () => {
    setLoading(true)
    try {
      const result = await api.getMasters("areas")
      setAreas(result.data || [])
      setMessage('')
    } catch (error) {
      console.error('Error loading areas:', error)
      setAreas([])
      setMessage('Error loading areas')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }


  const handleDelete = async (area) => {
    if (!window.confirm('Are you sure you want to delete this area?')) return
    try {
      await api.deleteMaster("area_master", area.id)
      setMessage('Deleted successfully')
      setMessageType('success')
      loadAreas()
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('Error deleting')
      setMessageType('error')
      console.error('Error deleting area:', error)
    }
  }


  const handleUpdate = (area) => {
    navigate(`/area-update?id=${area.id}`)
  }

  const handlePrint = (area) => {
    // Create a printable version of just this item
    const printWindow = window.open('', '_blank', 'width=600,height=400')
    printWindow.document.write(`
      <html>
        <head>
          <title>Area Details - ${area.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { color: #333; }
            table { width: 100%; border-collapse: collapse; }
            td { padding: 8px; border-bottom: 1px solid #ddd; }
            label { font-weight: bold; }
          </style>
        </head>
        <body>
          <h2>Area Details</h2>
          <table>
            <tr><td><label>Area Name:</label></td><td>${area.name}</td></tr>
            <tr><td><label>Print Name:</label></td><td>${area.print_name || ''}</td></tr>
            <tr><td><label>Status:</label></td><td>${area.status}</td></tr>
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

  // Define columns for the table
  const columns = [
    { key: 'sno', title: 'S.No', width: '60px', render: (_, __, index) => index + 1 },
    { key: 'name', title: 'Area Name' },
    { key: 'print_name', title: 'Print Name' },
    { key: 'status', title: 'Status', width: '100px' },
  ]

  // Custom render for actions column
  const actionColumn = {
    key: 'actions',
    title: 'Actions',
    width: '200px',
    render: (_, area) => (
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        <button onClick={() => handleUpdate(area)} style={styles.updateBtn}>Update</button>
        <button onClick={() => handlePrint(area)} style={styles.printBtn}>Print</button>
        <button onClick={() => handleDelete(area)} style={styles.deleteBtn}>Delete</button>
      </div>
    ),
  }

  return (
    <MasterTableLayout
      title="AREA MASTER"
      columns={columns}
      data={areas}
      onEdit={handleUpdate}
      onDelete={handleDelete}
      showActions={true}
    />
  )
}

const styles = {
  updateBtn: {
    padding: '6px 12px',
    backgroundColor: '#1976d2',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  printBtn: {
    padding: '6px 12px',
    backgroundColor: '#388e3c',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  deleteBtn: {
    padding: '6px 12px',
    backgroundColor: '#d32f2f',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
}

export default AreaDisplay
