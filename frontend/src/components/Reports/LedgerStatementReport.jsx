import React, { useState, useEffect } from 'react'
import { getSuppliers, getCustomers, getPapadCompanies, getLedgerStatementReport } from '../../utils/tauriApi'
import './ReportPage.css'

/**
 * LedgerStatementReport - Individual ledger transactions with running balance
 * Blue & White theme following the uniform information page format
 */
const LedgerStatementReport = () => {
  const [ledgers, setLedgers] = useState([])
  const [selectedLedger, setSelectedLedger] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Set default dates (current month)
  useEffect(() => {
    const today = new Date()
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    setFromDate(firstDay.toISOString().split('T')[0])
    setToDate(today.toISOString().split('T')[0])
  }, [])

  // Fetch ledgers for dropdown
  useEffect(() => {
    const fetchLedgers = async () => {
      try {
        // Fetch suppliers
        const suppliersRes = await getSuppliers()
        const suppliers = (suppliersRes.success && Array.isArray(suppliersRes.data)) ? suppliersRes.data : []
        
        // Fetch customers
        const customersRes = await getCustomers()
        const customers = (customersRes.success && Array.isArray(customersRes.data)) ? customersRes.data : []
        
        // Fetch papad companies
        const papadRes = await getPapadCompanies()
        const papads = (papadRes.success && Array.isArray(papadRes.data)) ? papadRes.data : []
        
        // Combine all ledgers
        const allLedgers = [
          ...suppliers.map(s => ({ id: s.id, name: s.name, type: 'Supplier' })),
          ...customers.map(c => ({ id: c.id, name: c.name, type: 'Customer' })),
          ...papads.map(p => ({ id: p.id, name: p.name, type: 'Papad Company' }))
        ]
        setLedgers(allLedgers)
      } catch (err) {
        console.error('Error fetching ledgers:', err)
        setLedgers([])
      }
    }
    fetchLedgers()
  }, [])

  // Fetch report data
  const fetchReport = async () => {
    if (!selectedLedger) return
    
    setLoading(true)
    setError('')
    
    try {
      const params = {}
      if (fromDate) params.from_date = fromDate
      if (toDate) params.to_date = toDate
      
      const result = await getLedgerStatementReport({ ledgerName: selectedLedger, ...params })
      
      if (result.success && result.data && typeof result.data === 'object') {
        setReportData(result.data)
      } else {
        setError(result.message || 'Failed to load Ledger Statement')
      }
    } catch (err) {
      console.error('Error fetching ledger:', err)
      setError('Failed to load Ledger Statement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedLedger) {
      fetchReport()
    }
  }, [selectedLedger, fromDate, toDate])

  const handlePrint = () => {
    window.print()
  }

  const safeTransactions = reportData?.transactions || []

  return (
    <div className="window">
      <div className="screen-title">Ledger Statement</div>

      {/* Filter Section */}
      <div className="report-filters">
        <div className="filter-row">
          <div className="filter-group">
            <label>Select Ledger:</label>
            <select
              className="uniform-input"
              value={selectedLedger}
              onChange={(e) => setSelectedLedger(e.target.value)}
            >
              <option value="">Select Ledger</option>
              {ledgers.map(ledger => (
                <option key={ledger.id} value={ledger.name}>
                  {ledger.name} ({ledger.type})
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>From Date:</label>
            <input
              type="date"
              className="uniform-input"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>To Date:</label>
            <input
              type="date"
              className="uniform-input"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>&nbsp;</label>
            <button className="btn btn-primary" onClick={fetchReport}>
              Search
            </button>
          </div>

          <div className="filter-group">
            <label>&nbsp;</label>
            <button className="btn btn-secondary" onClick={handlePrint}>
              Print
            </button>
          </div>
        </div>
      </div>

      {error && <div className="message-box error">{error}</div>}
      {loading && <div className="loading">Loading...</div>}

      {/* Ledger Header */}
      {!loading && reportData && (
        <div className="ledger-header">
          <h3>{reportData.ledgerName}</h3>
          <p>Opening Balance: {parseFloat(reportData.openingBalance || 0).toFixed(2)}</p>
        </div>
      )}

      {/* Report Table */}
      {!loading && reportData && (
        <div className="report-table-container">
          <table className="report-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Voucher Type</th>
                <th>Voucher No</th>
                <th>Particulars</th>
                <th className="text-right">Debit</th>
                <th className="text-right">Credit</th>
                <th className="text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {safeTransactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">No transactions found</td>
                </tr>
              ) : (
                <>
                  {safeTransactions.map((row, index) => (
                    <tr key={index}>
                      <td>{row.date ? new Date(row.date).toLocaleDateString() : '-'}</td>
                      <td>{row.voucher_type || '-'}</td>
                      <td>{row.voucher_no || '-'}</td>
                      <td>{row.particulars || '-'}</td>
                      <td className="text-right">{parseFloat(row.debit || 0).toFixed(2)}</td>
                      <td className="text-right">{parseFloat(row.credit || 0).toFixed(2)}</td>
                      <td className="text-right">{parseFloat(row.balance || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="total-row">
                    <td colSpan="4"><strong>Closing Balance</strong></td>
                    <td></td>
                    <td></td>
                    <td className="text-right"><strong>{parseFloat(reportData.closingBalance || 0).toFixed(2)}</strong></td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default LedgerStatementReport
