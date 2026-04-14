import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './ReportPage.css'

/**
 * StockStatusReport - Real-time stock position with Stock In/Out and Current Balance
 * Fixed version with robust data handling
 */
const StockStatusReport = () => {
  const [reportMode, setReportMode] = useState('summary') // 'summary' or 'lot'
  const [items, setItems] = useState([])
  const [selectedItem, setSelectedItem] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [stockData, setStockData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Fetch items for dropdown
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get('/api/masters/item_master')
        const itemsData = Array.isArray(response.data) 
          ? response.data 
          : (response.data?.data || [])
        setItems(itemsData)
      } catch (err) {
        console.error('Error fetching items:', err)
        setItems([])
      }
    }
    fetchItems()
  }, [])

  // Fetch stock report
  const fetchReport = async () => {
    setLoading(true)
    setError('')
    
    try {
      let url = ''
      let params = {}
      
      if (reportMode === 'summary') {
        url = '/api/reports/stock-status'
        if (selectedItem) params.item_id = selectedItem
        if (fromDate) params.from_date = fromDate
        if (toDate) params.to_date = toDate
      } else {
        url = '/api/stock/lots'
        if (selectedItem) params.item_id = selectedItem
      }
      
      const queryString = new URLSearchParams(params).toString()
      const response = await axios.get(`${url}${queryString ? '?' + queryString : ''}`)
      
      // Robust data handling - ensure we always have an array
      let responseData = []
      if (response.data) {
        if (Array.isArray(response.data)) {
          responseData = response.data
        } else if (typeof response.data === 'object') {
          responseData = Array.isArray(response.data.data) ? response.data.data : []
        }
      }
      setStockData(responseData)
    } catch (err) {
      console.error('Error fetching stock report:', err)
      setError('Failed to load stock report')
      setStockData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [reportMode, selectedItem, fromDate, toDate])

  const handlePrint = () => {
    window.print()
  }

  // Ensure data is always an array
  const safeStockData = Array.isArray(stockData) ? stockData : []

  return (
    <div className="window">
      <div className="screen-title">Stock Status Report</div>

      {/* Filters Section */}
      <div className="report-filters">
        <div className="filter-row">
          <div className="filter-group">
            <label>Report Mode:</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="reportMode"
                  value="summary"
                  checked={reportMode === 'summary'}
                  onChange={(e) => setReportMode(e.target.value)}
                />
                Product Summary
              </label>
              <label>
                <input
                  type="radio"
                  name="reportMode"
                  value="lot"
                  checked={reportMode === 'lot'}
                  onChange={(e) => setReportMode(e.target.value)}
                />
                Lot Breakdown
              </label>
            </div>
          </div>

          <div className="filter-group">
            <label>Item:</label>
            <select
              className="uniform-input"
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
            >
              <option value="">All Items</option>
              {items.map(item => (
                <option key={item.id} value={item.id}>{item.name || item.item_name}</option>
              ))}
            </select>
          </div>

          {reportMode === 'summary' && (
            <>
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
            </>
          )}

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

      {/* Error Message */}
      {error && <div className="message-box error">{error}</div>}

      {/* Loading */}
      {loading && <div className="loading">Loading...</div>}

      {/* Product Summary Mode */}
      {!loading && reportMode === 'summary' && (
        <div className="report-table-container">
          <table className="report-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th className="text-right">Total Purchased</th>
                <th className="text-right">Total Sold</th>
                <th className="text-right">Current Balance</th>
              </tr>
            </thead>
            <tbody>
              {safeStockData.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center">No data available</td>
                </tr>
              ) : (
                safeStockData.map((row, index) => (
                  <tr key={index}>
                    <td>{row.item_name}</td>
                    <td className="text-right">{parseFloat(row.total_purchased || 0).toFixed(2)}</td>
                    <td className="text-right">{parseFloat(row.total_sold || 0).toFixed(2)}</td>
                    <td className="text-right" style={{ fontWeight: 'bold', color: (row.current_balance || 0) < 0 ? 'red' : 'green' }}>
                      {parseFloat(row.current_balance || 0).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Lot Breakdown Mode */}
      {!loading && reportMode === 'lot' && (
        <div className="report-table-container">
          <table className="report-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Lot No</th>
                <th>Purchase Date</th>
                <th className="text-right">Purchased</th>
                <th className="text-right">Sold</th>
                <th className="text-right">Remaining</th>
                <th className="text-right">Rate</th>
              </tr>
            </thead>
            <tbody>
              {safeStockData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">No data available</td>
                </tr>
              ) : (
                safeStockData.map((row, index) => (
                  <tr key={index}>
                    <td>{row.item_name}</td>
                    <td>{row.lot_no}</td>
                    <td>{row.created_at ? new Date(row.created_at).toLocaleDateString() : '-'}</td>
                    <td className="text-right">{parseFloat(row.purchased_qty || 0).toFixed(2)}</td>
                    <td className="text-right">{parseFloat(row.sold_qty || 0).toFixed(2)}</td>
                    <td className="text-right" style={{ fontWeight: 'bold', color: (row.remaining_quantity || 0) <= 0 ? 'red' : 'green' }}>
                      {parseFloat(row.remaining_quantity || 0).toFixed(2)}
                    </td>
                    <td className="text-right">{parseFloat(row.rate || 0).toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default StockStatusReport
