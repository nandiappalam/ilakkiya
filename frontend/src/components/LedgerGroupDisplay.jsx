import React, { useState, useEffect, useRef } from 'react'
import api from '../utils/api.js'
import MasterTableLayout from './master/MasterTableLayout'

const LedgerGroupDisplay = () => {
  const [ledgerGroups, setLedgerGroups] = useState([])
  const [loading, setLoading] = useState(true)

  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    loadLedgerGroups()
  }, [])

  const loadLedgerGroups = async () => {
    try {
      const result = await api.getLedgerGroups()
      if (result.success) {
        setLedgerGroups(result.data || [])
      }
    } catch (error) {
      console.error('Error loading ledger groups:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (group) => {
    if (!window.confirm('Are you sure you want to delete this ledger group?')) return

    try {
      const result = await api.deleteMaster('ledger_group_master', group.id)
      if (result.success) {
        alert('Ledger group deleted successfully')
        loadLedgerGroups()
      } else {
        alert('Error deleting ledger group: ' + result.message)
      }
    } catch (error) {
      alert('Error deleting ledger group')
      console.error('Error deleting ledger group:', error)
    }
  }

  const handleUpdate = (group) => {
    alert('Update functionality - Ledger Group ID: ' + group.id)
  }

  const handlePrint = (group) => {
    const printWindow = window.open('', '', 'width=800,height=600')
    printWindow.document.write(`
      <html><head><title>Ledger Group</title></head><body>
      <h3>Ledger Group Details</h3>
      <p><b>Name:</b> ${group.name}</p>
      <p><b>Print Name:</b> ${group.printname}</p>
      <p><b>Under:</b> ${group.under}</p>
      </body></html>
    `)
    printWindow.print()
  }

  const columns = [
    { key: 'sno', title: 'S.No', width: '50px', render: (_, __, index) => index + 1 },
    { key: 'name', title: 'Group Name' },
    { key: 'printname', title: 'Print Name' },
    { key: 'under', title: 'Under' },
  ]

  return (
    <MasterTableLayout
      title="LEDGER GROUP MASTER"
      columns={columns}
      data={ledgerGroups}
      onEdit={handleUpdate}
      onDelete={handleDelete}
      showActions={true}
    />
  )
}

export default LedgerGroupDisplay
