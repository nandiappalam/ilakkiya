import React from 'react'
import { Link } from 'react-router-dom'
import './ReportsIndex.css'

/**
 * ReportsIndex - Main Reports Dashboard
 * Shows all available report modules
 */
const ReportsIndex = () => {
  const reports = [
    {
      id: 'stock-status',
      title: 'Stock Status',
      description: 'Real-time stock position with Stock In/Out and Current Balance',
      icon: '📦',
      path: '/reports/stock-status'
    },
    {
      id: 'lot-history',
      title: 'Lot History',
      description: 'Track full lifecycle of a specific lot',
      icon: '🔍',
      path: '/reports/lot-history'
    },
    {
      id: 'purchase-register',
      title: 'Purchase Register',
      description: 'All purchase entries with supplier and item details',
      icon: '🛒',
      path: '/reports/purchase-register'
    },
    {
      id: 'purchase-return-register',
      title: 'Purchase Return Register',
      description: 'Track returned purchase items',
      icon: '↩️',
      path: '/reports/purchase-return-register'
    },
    {
      id: 'sales-register',
      title: 'Sales Register',
      description: 'All sales entries with customer and item details',
      icon: '💰',
      path: '/reports/sales-register'
    },
    {
      id: 'sales-return-register',
      title: 'Sales Return Register',
      description: 'Track returned sales items',
      icon: '🔄',
      path: '/reports/sales-return-register'
    },
    {
      id: 'papad-ledger',
      title: 'Papad Ledger',
      description: 'Supplier payments, Customer receipts, Debit/Credit entries',
      icon: '📒',
      path: '/reports/papad-ledger'
    }
  ]

  // Accounts Reports
  const accountsReports = [
    {
      id: 'day-book',
      title: 'Day Book',
      description: 'All transactions date-wise in chronological order',
      icon: '📅',
      path: '/reports/day-book'
    },
    {
      id: 'trial-balance',
      title: 'Trial Balance',
      description: 'Ledger-wise Debit & Credit summary',
      icon: '⚖️',
      path: '/reports/trial-balance'
    },
    {
      id: 'balance-sheet',
      title: 'Balance Sheet',
      description: 'Assets & Liabilities statement',
      icon: '📊',
      path: '/reports/balance-sheet'
    },
    {
      id: 'profit-loss',
      title: 'Profit & Loss',
      description: 'Income & Expenses statement',
      icon: '📈',
      path: '/reports/profit-loss'
    },
    {
      id: 'ledger-statement',
      title: 'Ledger Statement',
      description: 'Individual ledger transactions with running balance',
      icon: '📖',
      path: '/reports/ledger-statement'
    },
    {
      id: 'outstanding-summary',
      title: 'Outstanding Summary',
      description: 'Pending balances summary',
      icon: '⏳',
      path: '/reports/outstanding-summary'
    },
    {
      id: 'outstanding-details',
      title: 'Outstanding Details',
      description: 'Bill-wise pending details',
      icon: '📋',
      path: '/reports/outstanding-details'
    }
  ]

  return (
    <div className="window">
      <div className="screen-title">Reports Dashboard</div>
      
      {/* Inventory & Transaction Reports */}
      <div className="reports-section">
        <h3 className="section-title">Inventory & Transactions</h3>
        <div className="reports-grid">
          {reports.map((report) => (
            <Link to={report.path} key={report.id} className="report-card">
              <div className="report-icon">{report.icon}</div>
              <div className="report-info">
                <h3>{report.title}</h3>
                <p>{report.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Accounts Reports */}
      <div className="reports-section">
        <h3 className="section-title">Accounts</h3>
        <div className="reports-grid">
          {accountsReports.map((report) => (
            <Link to={report.path} key={report.id} className="report-card">
              <div className="report-icon">{report.icon}</div>
              <div className="report-info">
                <h3>{report.title}</h3>
                <p>{report.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ReportsIndex
