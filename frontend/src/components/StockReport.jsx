import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './erp-theme.css'

/**
 * StockReport - Stock Report Page
 * Styled to match original HTML format
 * Supports Product Summary and Lot Breakdown modes
 */
const StockReport = () => {
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
        const response = await axios.get('/api/masters/items')
        const itemsData = Array.isArray(response.data) ? response.data : (response.data?.data || [])
        setItems(itemsData)
      } catch (err) {
        console.error('Error fetching items:', err)
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
        url = '/api/stock/report'
        if (selectedItem) params.item_id = selectedItem
        if (fromDate) params.from_date = fromDate
        if (toDate) params.to_date = toDate
      } else {
        url = '/api/stock/lots'
        if (selectedItem) params.item_id = selectedItem
      }
      
      const queryString = new URLSearchParams(params).toString()
      const response = await axios.get(`${url}${queryString ? '?' + queryString : ''}`)
      
      // Ensure data is array
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

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchReport()
  }, [reportMode, selectedItem, fromDate, toDate])

  const handleRefresh = () => {
    fetchReport()
  }

  const handlePrint = () => {
    window.print()
  }

  const safeData = Array.isArray(stockData) ? stockData : []

  return (
    <div style={styles.container}>
      {/* Title Bar - matches HTML format */}
      <div style={styles.titleBar}>
        <span style={styles.titleText}>Stock Report</span>
        
        <div style={styles.dateBox}>
          {/* Report Mode Selection */}
          <span style={styles.filterItem}>
            Report :
            <label style={styles.radioLabel}>
              <input
                type="radio"
                name="reportMode"
                value="summary"
                checked={reportMode === 'summary'}
                onChange={(e) => setReportMode(e.target.value)}
                style={styles.radio}
              />
              Product Summary
            </label>
            <label style={styles.radioLabel}>
              <input
                type="radio"
                name="reportMode"
                value="lot"
                checked={reportMode === 'lot'}
                onChange={(e) => setReportMode(e.target.value)}
                style={styles.radio}
              />
              Lot Breakdown
            </label>
          </span>

          {/* Item Filter */}
          <span style={styles.filterItem}>
            Item :
            <select
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="">All Items</option>
              {items.map(item => (
                <option key={item.id} value={item.id}>{item.name || item.item_name}</option>
              ))}
            </select>
          </span>

          {/* Date Filters - only for Summary mode */}
          {reportMode === 'summary' && (
            <>
              <span style={styles.filterItem}>
                From Date :
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  style={styles.filterInput}
                />
              </span>
              <span style={styles.filterItem}>
                To Date :
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  style={styles.filterInput}
                />
              </span>
            </>
          )}

          <button onClick={handleRefresh} style={styles.searchBtn}>Search</button>
        </div>
      </div>

      {/* Error Message */}
      {error && <div style={styles.errorMessage}>{error}</div>}

      {/* Loading */}
      {loading && <div style={styles.loading}>Loading...</div>}

      {/* Data Table - matches HTML format */}
      {!loading && (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              {reportMode === 'summary' ? (
                <tr>
                  <th style={styles.th}>Item Name</th>
                  <th style={styles.th}>Total Purchased</th>
                  <th style={styles.th}>Total Sold</th>
                  <th style={styles.th}>Balance</th>
                </tr>
              ) : (
                <tr>
                  <th style={styles.th}>Item Name</th>
                  <th style={styles.th}>Lot No</th>
                  <th style={styles.th}>Purchase Date</th>
                  <th style={styles.th}>Purchased</th>
                  <th style={styles.th}>Sold</th>
                  <th style={styles.th}>Remaining</th>
                  <th style={styles.th}>Rate</th>
                </tr>
              )}
            </thead>
            <tbody>
              {safeData.length === 0 ? (
                <tr>
                  <td colSpan={reportMode === 'summary' ? 4 : 7} style={styles.noData}>
                    No data available
                  </td>
                </tr>
              ) : (
                safeData.map((row, index) => (
                  <tr key={index}>
                    {reportMode === 'summary' ? (
                      <>
                        <td style={styles.td}>{row.item_name}</td>
                        <td style={{...styles.td, textAlign: 'right'}}>{parseFloat(row.total_purchased || 0).toFixed(2)}</td>
                        <td style={{...styles.td, textAlign: 'right'}}>{parseFloat(row.total_sold || 0).toFixed(2)}</td>
                        <td style={{
                          ...styles.td, 
                          textAlign: 'right', 
                          fontWeight: 'bold', 
                          color: (row.balance || 0) < 0 ? 'red' : 'green'
                        }}>
                          {parseFloat(row.balance || 0).toFixed(2)}
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={styles.td}>{row.item_name}</td>
                        <td style={styles.td}>{row.lot_no}</td>
                        <td style={styles.td}>{row.created_at ? new Date(row.created_at).toLocaleDateString() : '-'}</td>
                        <td style={{...styles.td, textAlign: 'right'}}>{parseFloat(row.purchased_qty || 0).toFixed(2)}</td>
                        <td style={{...styles.td, textAlign: 'right'}}>{parseFloat(row.sold_qty || 0).toFixed(2)}</td>
                        <td style={{
                          ...styles.td, 
                          textAlign: 'right', 
                          fontWeight: 'bold', 
                          color: (row.remaining_quantity || 0) <= 0 ? 'red' : 'green'
                        }}>
                          {parseFloat(row.remaining_quantity || 0).toFixed(2)}
                        </td>
                        <td style={{...styles.td, textAlign: 'right'}}>{parseFloat(row.rate || 0).toFixed(2)}</td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer - matches HTML format */}
      <div style={styles.footerBar}>
        <div style={styles.footerLeft}>
          <button onClick={handlePrint} style={styles.printBtn}>Print</button>
          <button style={styles.actionBtn}>Edit</button>
          <button style={styles.actionBtn}>Update</button>
        </div>
        <div style={styles.footerRight}>
          Row(s): {safeData.length}
        </div>
      </div>
    </div>
  )
}

// Styles matching original HTML format
const styles = {
  container: {
    margin: '0',
    fontFamily: 'Arial, sans-serif',
    background: '#eaf2ff',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column'
  },
  // Title Bar
  titleBar: {
    background: '#f5f8ff',
    borderBottom: '1px solid #9bb6e5',
    padding: '6px 10px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  titleText: {
    fontWeight: 'bold',
    fontSize: '16px',
    color: '#333'
  },
  dateBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap'
  },
  filterItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '13px'
  },
  radioLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
    marginRight: '10px',
    cursor: 'pointer'
  },
  radio: {
    marginRight: '3px'
  },
  filterInput: {
    marginLeft: '5px',
    padding: '4px 6px',
    border: '1px solid #9bb6e5',
    borderRadius: '3px',
    fontSize: '13px',
    background: '#fff'
  },
  filterSelect: {
    marginLeft: '5px',
    padding: '4px 6px',
    border: '1px solid #9bb6e5',
    borderRadius: '3px',
    fontSize: '13px',
    background: '#fff',
    minWidth: '120px'
  },
  searchBtn: {
    background: '#2c5fb8',
    color: 'white',
    border: 'none',
    padding: '5px 12px',
    cursor: 'pointer',
    fontSize: '13px',
    borderRadius: '3px',
    marginLeft: '5px'
  },
  // Error
  errorMessage: {
    padding: '10px',
    background: '#f8d7da',
    color: '#721c24',
    margin: '10px',
    borderRadius: '4px'
  },
  // Loading
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#2c5fb8',
    fontSize: '14px'
  },
  // Table Container
  tableContainer: {
    padding: '10px',
    flex: '1'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    background: 'white'
  },
  // Table Header
  th: {
    background: '#2c5fb8',
    color: 'white',
    border: '1px solid #9bb6e5',
    padding: '5px',
    fontSize: '13px',
    textAlign: 'left',
    fontWeight: 'bold'
  },
  td: {
    border: '1px solid #c5d6f5',
    height: '28px',
    padding: '5px',
    fontSize: '13px'
  },
  noData: {
    textAlign: 'center',
    padding: '40px',
    color: '#999'
  },
  // Footer Bar
  footerBar: {
    background: '#f5f8ff',
    borderTop: '1px solid #9bb6e5',
    padding: '6px 10px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  footerLeft: {
    display: 'flex',
    gap: '5px'
  },
  footerRight: {
    fontWeight: 'bold',
    fontSize: '13px'
  },
  printBtn: {
    background: '#2c5fb8',
    color: 'white',
    border: 'none',
    padding: '5px 12px',
    cursor: 'pointer',
    fontSize: '13px',
    borderRadius: '3px'
  },
  actionBtn: {
    background: '#2c5fb8',
    color: 'white',
    border: 'none',
    padding: '5px 12px',
    cursor: 'pointer',
    fontSize: '13px',
    borderRadius: '3px'
  }
}

export default StockReport
