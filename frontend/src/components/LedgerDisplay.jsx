import React, { useState, useEffect, useRef } from 'react'
import api from '../utils/api.js'
import MasterTableLayout from './master/MasterTableLayout'

const LedgerDisplay = () => {
  const [ledgers, setLedgers] = useState([])

  const hasFetched = useRef(false);
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchLedgers()
  }, [])

  const fetchLedgers = async () => {
    try {
      const result = await api.getLedgers()
      if (result.success) {
        setLedgers(result.data)
      } else {
        console.error('Error loading ledgers:', result.message)
      }
    } catch (error) {
      console.error('Error loading ledgers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (ledger) => {
    if (!window.confirm('Are you sure you want to delete this ledger?')) return
    try {
      const result = await api.deleteLedger(ledger.id)
      if (result.success) {
        alert('Deleted successfully')
        fetchLedgers()
      } else {
        alert('Error deleting ledger: ' + result.message)
      }
    } catch (error) {
      alert('Error deleting ledger')
      console.error('Error deleting ledger:', error)
    }
  }

  const handleUpdate = (ledger) => {
    alert('Update functionality - Ledger ID: ' + ledger.id)
  }

  const handlePrint = (ledger) => {
    const printWindow = window.open('', '', 'width=800,height=600')
    printWindow.document.write(`
      <html><head><title>Ledger</title></head><body>
      <h3>Ledger Details</h3>
      <p><b>Name:</b> ${ledger.name}</p>
      <p><b>Print Name:</b> ${ledger.printname}</p>
      <p><b>Under:</b> ${ledger.under}</p>
      <p><b>Opening Balance:</b> ${ledger.openingbalance}</p>
      <p><b>Area:</b> ${ledger.area}</p>
      <p><b>Credit:</b> ${ledger.credit}</p>
      <p><b>Debit:</b> ${ledger.debit}</p>
      </body></html>
    `)
    printWindow.print()
  }

  const columns = [
    { key: 'sno', title: 'S.No', width: '60px', render: (_, __, index) => index + 1 },
    { key: 'name', title: 'Name' },
    { key: 'printname', title: 'Print Name' },
    { key: 'under', title: 'Under' },
    { key: 'openingbalance', title: 'Opening Balance' },
    { key: 'area', title: 'Area' },
    { key: 'credit', title: 'Credit' },
    { key: 'debit', title: 'Debit' },
  ]

  return (
    <MasterTableLayout
      title="LEDGER MASTER"
      columns={columns}
      data={ledgers}
      onEdit={handleUpdate}
      onDelete={handleDelete}
      showActions={true}
    />
  )
}

export default LedgerDisplay
