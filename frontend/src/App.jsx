import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { Box } from '@mui/material'
import { AuthProvider, useAuth } from './context/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import CompanySelection from './components/CompanySelection'
import LoginPage from './components/LoginPage'
import AuthChoice from './components/AuthChoice'
import CompanyCreate from './components/CompanyCreate'
import CompanyDisplay from './components/CompanyDisplay'
import UserCreate from './components/UserCreate'
import UserDisplay from './components/UserDisplay'
import Dashboard from './components/Dashboard'
import CrudPage from './components/CrudPage'
import Navigation from './components/Navigation'

// Entry Pages
import PurchaseCreationPage from './components/PurchaseCreation'
import PurchaseDisplay from './components/PurchaseDisplay'
import GrainsCreation from './components/GrainsCreation'
import GrainsDisplay from './components/GrainsDisplay'
import FlourOutCreation from './components/FlourOutCreation'
import FlourOutDisplay from './components/FlourOutDisplay'
import FlourOutReturnCreation from './components/FlourOutReturnCreation'
import FlourOutReturnDisplay from './components/FlourOutReturnDisplay'
import PurchaseReturn from './components/PurchaseReturn'
import PurchaseReturnDisplay from './components/PurchaseReturnDisplay'
import SalesCreationPage from './components/SalesCreationPage'
import SalesDisplayPage from './components/SalesDisplayPage'
import SalesReturnCreate from './components/SalesReturnCreate'
import SalesReturnDisplay from './components/SalesReturnDisplay'
import ItemCreate from './components/ItemCreate'
import ItemDisplay from './components/ItemDisplay'
import ItemGroupCreate from './components/ItemGroupCreate'
import ItemGroupDisplay from './components/ItemGroupDisplay'

// Master Pages
import CustomerCreate from './components/CustomerCreate'
import CustomerDisplay from './components/CustomerDisplay'
import SupplierCreate from './components/SupplierCreate'
import SupplierDisplay from './components/SupplierDisplay'
import AreaCreate from './components/AreaCreate'
import AreaDisplay from './components/AreaDisplay'
import AreaUpdate from './components/AreaUpdate'
import CityCreate from './components/CityCreate'
import CityDisplay from './components/CityDisplay'
import CityUpdate from './components/CityUpdate'
import LedgerCreate from './components/LedgerCreate'
import LedgerDisplay from './components/LedgerDisplay'
import ConsigneeCreate from './components/ConsigneeCreate'
import ConsigneeDisplay from './components/ConsigneeDisplay'
import PTransCreate from './components/PTransCreate'
import PTransDisplay from './components/PTransDisplay'
import PTransUpdate from './components/PTransUpdate'
import DeductionSalesCreate from './components/DeductionSalesCreate'
import DeductionSalesDisplay from './components/DeductionSalesDisplay'
import DeductionPurchaseCreate from './components/DeductionPurchaseCreate'
import DeductionPurchaseDisplay from './components/DeductionPurchaseDisplay'
import FlourMillCreate from './components/FlourMillCreate'
import FlourMillDisplay from './components/FlourMillDisplay'
import PapadCompanyCreate from './components/PapadCompanyCreate'
import PapadCompanyDisplay from './components/PapadCompanyDisplay'
import WeightCreate from './components/WeightCreate'
import WeightDisplay from './components/WeightDisplay'
import LedgerGroupCreate from './components/LedgerGroupCreate'
import LedgerGroupDisplay from './components/LedgerGroupDisplay'
import SenderCreate from './components/SenderCreate'
import SenderDisplay from './components/SenderDisplay'
import TransportCreate from './components/TransportCreate'
import TransportDisplay from './components/TransportDisplay'
import GodownCreate from './components/master/GodownCreate'
import GodownDisplay from './components/master/GodownDisplay'

// Financial Year
import FinancialYearDisplay from './components/FinancialYearDisplay'

// Additional Entry Pages
import PapadInCreate from './components/PapadInCreate'
import PapadInDisplay from './components/PapadInDisplay'
import SalesCreate from './components/SalesCreate'
import SalesExportCreate from './components/SalesExportCreate'
import SalesExportDisplay from './components/SalesExportDisplay'
import SalesExportOrderCreate from './components/SalesExportOrderCreate'
import SalesExportOrderDisplay from './components/SalesExportOrderDisplay'
import QuotationCreate from './components/QuotationCreate'
import QuotationDisplay from './components/QuotationDisplay'
import StockAdjustCreate from './components/StockAdjustCreate'
import StockAdjustDisplay from './components/StockAdjustDisplay'
import PackingCreate from './components/PackingCreate'
import PackingDisplay from './components/PackingDisplay'
import AdvanceCreate from './components/AdvanceCreate'
import AdvanceDisplay from './components/AdvanceDisplay'
import OpenCreate from './components/OpenCreate'
import WeightConversionCreate from './components/WeightConversionCreate'
import WeightConversionDisplay from './components/WeightConversionDisplay'
import StockReport from './components/StockReport'
import ReportPage from './components/ReportPage'

// Reports
import { 
  ReportsIndex,
  StockStatusReport, 
  PurchaseRegisterReport, 
  SalesRegisterReport,
  PurchaseReturnRegisterReport,
  SalesReturnRegisterReport,
  PapadLedgerReport,
  DayBookReport,
  TrialBalanceReport,
  BalanceSheetReport,
  ProfitLossReport,
  LedgerStatementReport,
  OutstandingSummaryReport,
  OutstandingDetailsReport
} from './components/Reports'

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
})

// Layout component that checks auth state
const AppLayout = () => {
  const { user, selectedCompany, loading, isSidebarOpen } = useAuth()

  // If still loading, show nothing
  if (loading) {
    return null
  }

  // If not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // If logged in but no company (shouldn't happen with proper login), redirect to login
  if (!selectedCompany) {
    return <Navigate to="/login" replace />
  }

  // Otherwise show the main app with navigation
  return (
    <>
      <Navigation />
      <Box sx={{
        mt: '64px',
        width: '100%',
        minHeight: 'calc(100vh - 64px)',
        overflow: 'auto',
        padding: { xs: 2, sm: 3 },
        boxSizing: 'border-box'
      }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/city-update" element={<CityUpdate />} />
          <Route path="/ptrans-update" element={<PTransUpdate />} />
          <Route path="/area-update" element={<AreaUpdate />} />
          <Route path="/report/stock-report" element={<StockReport />} />
          
          {/* Report Routes */}
          <Route path="/report/stock-status" element={<ReportPage reportType="stock-status" />} />
          <Route path="/report/lot-history" element={<ReportPage reportType="lot-history" />} />
          <Route path="/report/purchase-register" element={<ReportPage reportType="purchase-register" />} />
          <Route path="/report/purchase-return-register" element={<ReportPage reportType="purchase-return-register" />} />
          <Route path="/report/sales-register" element={<ReportPage reportType="sales-register" />} />
          <Route path="/report/sales-return-register" element={<ReportPage reportType="sales-return-register" />} />
          <Route path="/report/papad-ledger" element={<ReportPage reportType="papad-ledger" />} />
          
          {/* New Report Pages */}
          <Route path="/reports" element={<ReportsIndex />} />
          <Route path="/reports/stock-status" element={<StockStatusReport />} />
          <Route path="/reports/purchase-register" element={<PurchaseRegisterReport />} />
          <Route path="/reports/sales-register" element={<SalesRegisterReport />} />
          <Route path="/reports/purchase-return-register" element={<PurchaseReturnRegisterReport />} />
          <Route path="/reports/sales-return-register" element={<SalesReturnRegisterReport />} />
          <Route path="/reports/papad-ledger" element={<PapadLedgerReport />} />
          
          {/* Accounts Reports */}
          <Route path="/reports/day-book" element={<DayBookReport />} />
          <Route path="/reports/trial-balance" element={<TrialBalanceReport />} />
          <Route path="/reports/balance-sheet" element={<BalanceSheetReport />} />
          <Route path="/reports/profit-loss" element={<ProfitLossReport />} />
          <Route path="/reports/ledger-statement" element={<LedgerStatementReport />} />
          <Route path="/reports/outstanding-summary" element={<OutstandingSummaryReport />} />
          <Route path="/reports/outstanding-details" element={<OutstandingDetailsReport />} />
          
          {/* User Management */}
          <Route path="/master/user-create" element={<UserCreate />} />
          <Route path="/master/user-display" element={<UserDisplay />} />
          <Route path="/master/user-update/:userId" element={<UserCreate />} />

          {/* Features Routes */}
          <Route path="/features/financial-year" element={<FinancialYearDisplay />} />

          {/* Entry Routes */}
          <Route path="/entry/purchase-create" element={<PurchaseCreationPage />} />
          <Route path="/entry/purchase-display" element={<PurchaseDisplay />} />
          <Route path="/entry/grind-create" element={<GrainsCreation />} />
          <Route path="/entry/grind-display" element={<GrainsDisplay />} />
          <Route path="/entry/flour-out-create" element={<FlourOutCreation />} />
          <Route path="/entry/flour-out-display" element={<FlourOutDisplay />} />
          <Route path="/entry/flour-out-return-create" element={<FlourOutReturnCreation />} />
          <Route path="/entry/flour-out-return-display" element={<FlourOutReturnDisplay />} />
          <Route path="/entry/purchase-return-create" element={<PurchaseReturn />} />
          <Route path="/entry/purchase-return-display" element={<PurchaseReturnDisplay />} />
          <Route path="/entry/papad-in-create" element={<PapadInCreate />} />
          <Route path="/entry/papad-in-display" element={<PapadInDisplay />} />
          <Route path="/entry/sales-create" element={<SalesCreate />} />
          <Route path="/entry/sales-display" element={<SalesDisplayPage />} />
          <Route path="/entry/sales-export-create" element={<SalesExportCreate />} />
          <Route path="/entry/sales-export-display" element={<SalesExportDisplay />} />
          <Route path="/entry/sales-export-order-create" element={<SalesExportOrderCreate />} />
          <Route path="/entry/sales-export-order-display" element={<SalesExportOrderDisplay />} />
          <Route path="/entry/quotation-create" element={<QuotationCreate />} />
          <Route path="/entry/quotation-display" element={<QuotationDisplay />} />
          <Route path="/entry/sales-return-create" element={<SalesReturnCreate />} />
          <Route path="/entry/sales-return-display" element={<SalesReturnDisplay />} />
          <Route path="/entry/stock-adjust-create" element={<StockAdjustCreate />} />
          <Route path="/entry/stock-adjust-display" element={<StockAdjustDisplay />} />
          <Route path="/entry/packing-create" element={<PackingCreate />} />
          <Route path="/entry/packing-display" element={<PackingDisplay />} />
          <Route path="/entry/weight-create" element={<WeightCreate />} />
          <Route path="/entry/weight-display" element={<WeightDisplay />} />
          <Route path="/entry/advance-create" element={<AdvanceCreate />} />
          <Route path="/entry/advance-display" element={<AdvanceDisplay />} />
          <Route path="/entry/open-create" element={<OpenCreate />} />
          <Route path="/entry/weight-converstion-create" element={<WeightConversionCreate />} />
          <Route path="/entry/weight-converstion-display" element={<WeightConversionDisplay />} />

          {/* Master Routes */}
          <Route path="/master/item-create" element={<ItemCreate />} />
          <Route path="/master/item-display" element={<ItemDisplay />} />
          <Route path="/master/item-group-create" element={<ItemGroupCreate />} />
          <Route path="/master/item-group-display" element={<ItemGroupDisplay />} />
          <Route path="/master/customer-create" element={<CustomerCreate />} />
          <Route path="/master/customer-display" element={<CustomerDisplay />} />
          <Route path="/master/area-create" element={<AreaCreate />} />
          <Route path="/master/area-display" element={<AreaDisplay />} />
          <Route path="/master/city-create" element={<CityCreate />} />
          <Route path="/master/city-display" element={<CityDisplay />} />
          <Route path="/master/ledger-create" element={<LedgerCreate />} />
          <Route path="/master/ledger-display" element={<LedgerDisplay />} />
          <Route path="/master/consignee-create" element={<ConsigneeCreate />} />
          <Route path="/master/consignee-display" element={<ConsigneeDisplay />} />
          <Route path="/master/ptrans-create" element={<PTransCreate />} />
          <Route path="/master/ptrans-display" element={<PTransDisplay />} />
          <Route path="/master/deduction-purchase-create" element={<DeductionPurchaseCreate />} />
          <Route path="/master/deduction-purchase-display" element={<DeductionPurchaseDisplay />} />
          <Route path="/master/deduction-sales-create" element={<DeductionSalesCreate />} />
          <Route path="/master/deduction-sales-display" element={<DeductionSalesDisplay />} />
          <Route path="/master/flour-mill-create" element={<FlourMillCreate />} />
          <Route path="/master/flour-mill-display" element={<FlourMillDisplay />} />
          <Route path="/master/papad-company-create" element={<PapadCompanyCreate />} />
          <Route path="/master/papad-company-display" element={<PapadCompanyDisplay />} />
          <Route path="/master/ledger-group-create" element={<LedgerGroupCreate />} />
          <Route path="/master/ledger-group-display" element={<LedgerGroupDisplay />} />
          <Route path="/master/sender-create" element={<SenderCreate />} />
          <Route path="/master/sender-display" element={<SenderDisplay />} />
          <Route path="/master/transport-create" element={<TransportCreate />} />
          <Route path="/master/transport-display" element={<TransportDisplay />} />
          <Route path="/master/godown-create" element={<GodownCreate />} />
          <Route path="/master/godown-display" element={<GodownDisplay />} />
          <Route path="/master/company-display" element={<CompanyDisplay />} />

          <Route path="/master/suppliers-create" element={<SupplierCreate />} />
          <Route path="/master/suppliers-display" element={<SupplierDisplay />} />
        </Routes>
      </Box>
    </>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <Routes>
              {/* Root route - Redirect to Company Selection */}
              <Route path="/" element={<CompanySelection />} />
              
              {/* Public Routes */}
              <Route path="/company-select" element={<CompanySelection />} />
              <Route path="/company-create" element={<CompanyCreate />} />
              <Route path="/company-alter/:id" element={<CompanyCreate />} />
              <Route path="/company-display" element={<CompanyDisplay />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/auth-choice" element={<AuthChoice />} />
              <Route path="/user/create" element={<UserCreate />} />
              
              {/* Protected Routes */}
              <Route path="*" element={<AppLayout />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
