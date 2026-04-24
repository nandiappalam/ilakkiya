import React, { useState, useEffect, useRef } from 'react'
import { getMasters, deleteMaster } from '../services/masterservice'
import MasterTableLayout from './master/MasterTableLayout'

const TransportDisplay = () => {
  const [transports, setTransports] = useState([])
  const [loading, setLoading] = useState(true)

  const hasFetched = useRef(false);
  
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    loadTransports()
  }, [])

  const loadTransports = async () => {
    try {
const result = await getMasters('transports')
      if (result.success) {
        setTransports(result.data)
      } else {
        console.error('Error loading transports:', result.message)
      }
    } catch (err) {
      console.error('Error loading transports:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (transport) => {
    if (!window.confirm('Are you sure you want to delete this transport?')) return

    try {
const result = await deleteMaster('transport_master', transport.id)
      if (result.success) {
        alert('Transport deleted successfully')
        loadTransports()
      } else {
        alert('Failed to delete transport: ' + result.message)
      }
    } catch (error) {
      alert('Failed to delete transport')
      console.error('Error deleting transport:', error)
    }
  }

  const handleUpdate = (transport) => {
    alert('Update functionality - Transport ID: ' + transport.id)
  }

  const handlePrint = (transport) => {
    const printWindow = window.open('', '', 'width=800,height=600')
    printWindow.document.write(`
      <html><head><title>Transport</title></head><body>
      <h3>Transport Details</h3>
      <p><b>Name:</b> ${transport.name}</p>
      <p><b>Print Name:</b> ${transport.print_name}</p>
      <p><b>Status:</b> ${transport.status}</p>
      </body></html>
    `)
    printWindow.print()
  }

  const columns = [
    { key: 'sno', title: 'S.No', width: '60px', render: (_, __, index) => index + 1 },
    { key: 'name', title: 'Transport Name' },
    { key: 'print_name', title: 'Print Name' },
    { key: 'status', title: 'Status', width: '100px' },
  ]

  return (
    <MasterTableLayout
      title="TRANSPORT MASTER"
      columns={columns}
      data={transports}
      onEdit={handleUpdate}
      onDelete={handleDelete}
      showActions={true}
    />
  )
}

export default TransportDisplay
