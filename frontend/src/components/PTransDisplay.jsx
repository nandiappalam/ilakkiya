import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPTrans, deletePTrans } from '../utils/tauriApi'
import MasterTableLayout from './master/MasterTableLayout'

const PTransDisplay = () => {
  const [ptrans, setPtrans] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadPTrans()
  }, [])

  const loadPTrans = async () => {
    try {
      const result = await getPTrans()
      if (result.success) {
        setPtrans(result.data)
      } else {
        console.error('Error loading PTrans:', result.message)
      }
    } catch (err) {
      console.error('Error loading PTrans:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (item) => {
    if (!window.confirm('Are you sure you want to delete this PTrans?')) return

    try {
      const result = await deletePTrans(item.id)
      if (result.success) {
        alert('PTrans deleted successfully')
        loadPTrans()
      } else {
        alert('Error deleting PTrans: ' + result.message)
      }
    } catch (error) {
      alert('Error deleting PTrans: ' + error.message)
    }
  }

  const handleUpdate = (item) => {
    navigate(`/ptrans-update?id=${item.id}`)
  }

  const handlePrint = (item) => {
    const printWindow = window.open('', '_blank', 'width=600,height=400')
    printWindow.document.write(`
      <html>
        <head>
          <title>PTrans Details - ${item.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { color: #333; }
            table { width: 100%; border-collapse: collapse; }
            td { padding: 8px; border-bottom: 1px solid #ddd; }
            label { font-weight: bold; }
          </style>
        </head>
        <body>
          <h2>PTrans Details</h2>
          <table>
            <tr><td><label>PTrans Name:</label></td><td>${item.name}</td></tr>
            <tr><td><label>Print Name:</label></td><td>${item.print_name || ''}</td></tr>
            <tr><td><label>Status:</label></td><td>${item.status}</td></tr>
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
    { key: 'name', title: 'PTrans Name' },
    { key: 'print_name', title: 'Print Name' },
    { key: 'status', title: 'Status', width: '100px' },
  ]

  return (
    <MasterTableLayout
      title="PTRANS MASTER"
      columns={columns}
      data={ptrans}
      onEdit={handleUpdate}
      onDelete={handleDelete}
      showActions={true}
    />
  )
}

export default PTransDisplay
