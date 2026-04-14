import React, { useState, useEffect, useRef } from 'react'
import api from '../utils/api.js'
import MasterTableLayout from './master/MasterTableLayout'

const SenderDisplay = () => {
  const [senders, setSenders] = useState([])
  const [loading, setLoading] = useState(true)

  const hasFetched = useRef(false);
  
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    loadSenders()
  }, [])

  const loadSenders = async () => {
    try {
      const result = await api.getSenders()
      if (result.success) {
        setSenders(result.data)
      } else {
        console.error('Error loading senders:', result.message)
      }
    } catch (error) {
      console.error('Error loading senders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (sender) => {
    if (!window.confirm('Are you sure you want to delete this sender?')) return

    try {
      const result = await api.deleteMaster('sender_master', sender.id)
      if (result.success) {
        alert('Sender deleted successfully')
        loadSenders()
      } else {
        alert('Error deleting sender: ' + result.message)
      }
    } catch (error) {
      alert('Error deleting sender')
      console.error('Error deleting sender:', error)
    }
  }

  const handleUpdate = (sender) => {
    alert('Update functionality - Sender ID: ' + sender.id)
  }

  const handlePrint = (sender) => {
    const printWindow = window.open('', '', 'width=800,height=600')
    printWindow.document.write(`
      <html><head><title>Sender</title></head><body>
      <h3>Sender Details</h3>
      <p><b>Name:</b> ${sender.name}</p>
      <p><b>Print Name:</b> ${sender.print_name}</p>
      <p><b>Contact Person:</b> ${sender.contact_person}</p>
      <p><b>Area:</b> ${sender.area}</p>
      <p><b>Mobile:</b> ${sender.mobile}</p>
      </body></html>
    `)
    printWindow.print()
  }

  const columns = [
    { key: 'sno', title: 'S.No', width: '50px', render: (_, __, index) => index + 1 },
    { key: 'name', title: 'Name' },
    { key: 'print_name', title: 'Print Name' },
    { key: 'contact_person', title: 'Contact Person' },
    { key: 'area', title: 'Area' },
    { key: 'mobile', title: 'Mobile' },
    { key: 'status', title: 'Status', width: '80px' },
  ]

  return (
    <MasterTableLayout
      title="SENDER MASTER"
      columns={columns}
      data={senders}
      onEdit={handleUpdate}
      onDelete={handleDelete}
      showActions={true}
    />
  )
}

export default SenderDisplay
