import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getItemGroups, deleteItemGroup } from '../utils/tauriApi'
import MasterTableLayout from './master/MasterTableLayout'

const ItemGroupDisplay = () => {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadGroups()
  }, [])

  const loadGroups = async () => {
    try {
      const result = await getItemGroups()
      if (result.success) {
        setGroups(result.data)
      } else {
        console.error('Error loading item groups:', result.message)
      }
    } catch (error) {
      console.error('Error loading item groups:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (group) => {
    if (!confirm('Are you sure you want to delete this item group?')) return

    try {
      const result = await deleteItemGroup(group.id)
      if (result.success) {
        alert('Item group deleted successfully')
        loadGroups()
      } else {
        alert('Error deleting item group: ' + result.message)
      }
    } catch (error) {
      alert('Error deleting item group: ' + error.message)
    }
  }

  const handleUpdate = (group) => {
    alert('Update functionality - Group ID: ' + group.id)
  }

  const handlePrint = (group) => {
    const printWindow = window.open('', '_blank', 'width=600,height=400')
    printWindow.document.write(`
      <html>
        <head>
          <title>Item Group Details - ${group.group_name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { color: #333; }
            table { width: 100%; border-collapse: collapse; }
            td { padding: 8px; border-bottom: 1px solid #ddd; }
            label { font-weight: bold; }
          </style>
        </head>
        <body>
          <h2>Item Group Details</h2>
          <table>
            <tr><td><label>Group Name:</label></td><td>${group.group_name || ''}</td></tr>
            <tr><td><label>Print Name:</label></td><td>${group.print_name || ''}</td></tr>
            <tr><td><label>Status:</label></td><td>${group.status || 'Active'}</td></tr>
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
    { key: 'group_name', title: 'Group Name' },
    { key: 'print_name', title: 'Print Name' },
    { key: 'status', title: 'Status', width: '100px' },
  ]

  return (
    <MasterTableLayout
      title="ITEM GROUP MASTER"
      columns={columns}
      data={groups}
      onEdit={handleUpdate}
      onDelete={handleDelete}
      showActions={true}
    />
  )
}

export default ItemGroupDisplay
