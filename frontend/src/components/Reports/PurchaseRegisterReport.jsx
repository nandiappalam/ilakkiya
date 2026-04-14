import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './ReportPage.css'

/**
 * PurchaseRegisterReport - All purchase entries with supplier and item details
 * Fixed version with robust data handling
 */
const PurchaseRegisterReport = () => {
  const [suppliers, setSuppliers] = useState([])
  const [selectedSupplier, setSelectedSupplier] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [reportData, setReportData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Fetch suppliers for dropdown
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await axios.get('/api/masters/supplier_master')
        const suppliersData = Array.isArray(response.data) 
          ? response.data 
          : (response.data?.data || [])
        setSuppliers(suppliersData)
      } catch (err) {
        console.error('Error fetching suppliers:', err)
        setSuppliers([])
      }
    }
    fetchSuppliers()
  }, [])

  // Fetch report data
  const fetchReport = async () => {
    setLoading(true)
    setError('')
    
    try {
      const params = {}
      if (selectedSupplier) params.supplier_id = selectedSupplier
      if (fromDate) params.from_date = fromDate
      if (toDate) params.to_date = toDate
      
      const queryString = new URLSearchParams(params).toString()
      const response = await axios.get(`/api/reports/purchase-register${queryString ? '?' + queryString : ''}`)
      
      // Robust data handling
      let responseData = []
      if (response.data) {
        if (Array.isArray(response.data)) {
          responseData = response.data
        } else if (typeof response.data === 'object') {
          responseData = Array.isArray(response.data.data) ? response.data.data : []
        }
      }
      setReportData(responseData)
    } catch (err) {
      console.error('Error fetching purchase register:', err)
      setError('Failed to load purchase register')
      setReportData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [selectedSupplier, fromDate, toDate])

  const handlePrint = () => {
    window.print()
  }

  // Ensure data is always an array
  const safeReportData = Array.isArray(reportData) ? reportData : []

  // Calculate totals
  const totalAmount = safeReportData.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0)
  const totalQty = safeReportData.reduce((sum, row) => sum + (parseFloat(row.qty) || 0), 0)

  return (
    <div className="window">
      <div className="screen-title">Purchase Register</div>

      {/* Filters Section */}
      <div className="report-filters">
        <div className="filter-row">
          <div className="filter-group">
            <label>Supplier:</label>
            <select
              className="uniform-input"
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
            >
              <option value="">All Suppliers</option>
              {suppliers.map(supplier => (
                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
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
              Refresh
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

      {/* Report Table */}
      {!loading && (
        <div className="report-table-container">
          <table className="report-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Bill No</th>
                <th>Supplier</th>
                <th>Item</th>
                <th className="text-right">Qty</th>
                <th className="text-right">Rate</th>
                <th className="text-right">Amount</th>
                <th>Transport</th>
              </tr>
            </thead>
            <tbody>
              {safeReportData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center">No data available</td>
                </tr>
              ) : (
                <>
                  {safeReportData.map((row, index) => (
                    <tr key={index}>
                      <td>{row.date ? new Date(row.date).toLocaleDateString() : '-'}</td>
                      <td>{row.bill_no || '-'}</td>
                      <td>{row.supplier_name || '-'}</td>
                      <td>{row.item_name || '-'}</td>
                      <td className="text-right">{parseFloat(row.qty || 0).toFixed(2)}</td>
                      <td className="text-right">{parseFloat(row.rate || 0).toFixed(2)}</td>
                      <td className="text-right">{parseFloat(row.amount || 0).toFixed(2)}</td>
                      <td>{row.transport || '-'}</td>
                    </tr>
                  ))}
                  <tr className="total-row">
                    <td colSpan="4"><strong>Total</strong></td>
                    <td className="text-right"><strong>{totalQty.toFixed(2)}</strong></td>
                    <td></td>
                    <td className="text-right"><strong>{totalAmount.toFixed(2)}</strong></td>
                    <td></td>
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

export default PurchaseRegisterReport
