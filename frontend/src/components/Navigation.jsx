import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Collapse,
  IconButton,
  Box,
} from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth, MODULE_CATEGORIES, PERMISSION_TYPES } from '../context/AuthContext';

// ERP Theme Colors
const themeColors = {
  primary: '#1f4fb2',
  secondary: '#2a5ea0',
  lightBlue: '#dbe7fb',
  lighterBlue: '#eaf2fb',
  white: '#ffffff',
  textPrimary: '#333333',
};

// Module name mapping for permissions
const modulePermissionMap = {
  'Advance': 'Advance',
  'Flour Out': 'Flour Out',
  'Flour Out Return': 'Flour Out Return',
  'Grind': 'Grind',
  'Papad In': 'Papad In',
  'Packing': 'Packing',
  'Purchase': 'Purchase',
  'Purchase Return': 'Purchase Return',
  'Open': 'Open',
  'Quotation': 'Quotation',
  'Sales': 'Sales',
  'Sales Order': 'Sales Order',
  'Sales Export': 'Sales Export',
  'Sales Export Order': 'Sales Export Order',
  'Sales Return': 'Sales Return',
  'Stock Adjust': 'Stock Adjust',
  'Weight Conversion': 'Weight Conversion',
  // Master
  'Item': 'Item',
  'Item Group': 'Item Group',
  'Customer': 'Customer',
  'Suppliers': 'Supplier',
  'Flour Mill': 'Flour Mill',
  'Papad Company': 'Papad Company',
  'Weight': 'Weight',
  'Ledger Group': 'Ledger Group',
  'Ledger': 'Ledger',
  'Area': 'Area',
  'City': 'City',
  'Consignee': 'Consignee',
  'P.Trans': 'P.Trans',
  'Sender': 'Sender',
  'Transport': 'Transport',
  'Godown': 'Godown',
  'Deduction Sales': 'Deduction Sales',

  'Deduction Purchase': 'Deduction Purchase',
};

const EntryModuleItem = ({ module, actions, generatePath, toggleDrawer, hasPermission, isAdmin }) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const permissionModule = modulePermissionMap[module];

  // Check if user has any permission for this module
  if (!isAdmin && permissionModule && !hasPermission(permissionModule, PERMISSION_TYPES.VIEW)) {
    return null;
  }

  const handleClick = () => {
    setOpen(!open);
  };

  // Check if any child is active
  const isActive = actions.some(action => {
    const path = generatePath('entry', module, action)
    return location.pathname === path
  });

  return (
    <>
      <ListItemButton 
        onClick={handleClick} 
        sx={{ 
          pl: 4,
          backgroundColor: open || isActive ? themeColors.lighterBlue : 'transparent',
          '&:hover': {
            backgroundColor: themeColors.lightBlue,
          }
        }}
      >
        <ListItemText 
          primary={module} 
          primaryTypographyProps={{
            fontSize: '13px',
            fontWeight: isActive ? 'bold' : 'normal',
            color: isActive ? themeColors.primary : themeColors.textPrimary,
          }}
        />
        {open ? <ExpandLess sx={{ color: themeColors.primary }} /> : <ExpandMore sx={{ color: themeColors.primary }} />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {actions.map((action) => {
            const path = generatePath('entry', module, action)
            const isItemActive = location.pathname === path
            
            // Check specific permission based on action
            let canAccess = isAdmin;
            if (!isAdmin && permissionModule) {
              if (action === 'Create') {
                canAccess = hasPermission(permissionModule, PERMISSION_TYPES.CREATE);
              } else if (action === 'Display') {
                canAccess = hasPermission(permissionModule, PERMISSION_TYPES.VIEW);
              }
            }

            if (!canAccess) return null;

            return (
              <ListItemButton
                key={`${module}-${action}`}
                component={Link}
                to={path}
                onClick={toggleDrawer}
                sx={{ 
                  pl: 6,
                  backgroundColor: isItemActive ? themeColors.primary : 'transparent',
                  '&:hover': {
                    backgroundColor: themeColors.lightBlue,
                  }
                }}
              >
                <ListItemText 
                  primary={action}
                  primaryTypographyProps={{
                    fontSize: '12px',
                    fontWeight: isItemActive ? 'bold' : 'normal',
                    color: isItemActive ? themeColors.white : themeColors.textPrimary,
                  }}
                />
              </ListItemButton>
            )
          })}
        </List>
      </Collapse>
    </>
  )
}

const MasterModuleItem = ({ module, actions, generatePath, toggleDrawer, hasPermission, isAdmin }) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const permissionModule = modulePermissionMap[module];

  // Check if user has any permission for this module
  if (!isAdmin && permissionModule && !hasPermission(permissionModule, PERMISSION_TYPES.VIEW)) {
    return null;
  }

  const handleClick = () => {
    setOpen(!open);
  };

  // Check if any child is active
  const isActive = actions.some(action => {
    const path = generatePath('master', module, action)
    return location.pathname === path
  });

  return (
    <>
      <ListItemButton 
        onClick={handleClick} 
        sx={{ 
          pl: 4,
          backgroundColor: open || isActive ? themeColors.lighterBlue : 'transparent',
          '&:hover': {
            backgroundColor: themeColors.lightBlue,
          }
        }}
      >
        <ListItemText 
          primary={module}
          primaryTypographyProps={{
            fontSize: '13px',
            fontWeight: isActive ? 'bold' : 'normal',
            color: isActive ? themeColors.primary : themeColors.textPrimary,
          }}
        />
        {open ? <ExpandLess sx={{ color: themeColors.primary }} /> : <ExpandMore sx={{ color: themeColors.primary }} />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {actions.map((action) => {
            const path = generatePath('master', module, action)
            const isItemActive = location.pathname === path

            // Check specific permission based on action
            let canAccess = isAdmin;
            if (!isAdmin && permissionModule) {
              if (action === 'Create') {
                canAccess = hasPermission(permissionModule, PERMISSION_TYPES.CREATE);
              } else if (action === 'Display') {
                canAccess = hasPermission(permissionModule, PERMISSION_TYPES.VIEW);
              }
            }

            if (!canAccess) return null;

            return (
              <ListItemButton
                key={`${module}-${action}`}
                component={Link}
                to={path}
                onClick={toggleDrawer}
                sx={{ 
                  pl: 6,
                  backgroundColor: isItemActive ? themeColors.primary : 'transparent',
                  '&:hover': {
                    backgroundColor: themeColors.lightBlue,
                  }
                }}
              >
                <ListItemText 
                  primary={action}
                  primaryTypographyProps={{
                    fontSize: '12px',
                    fontWeight: isItemActive ? 'bold' : 'normal',
                    color: isItemActive ? themeColors.white : themeColors.textPrimary,
                  }}
                />
              </ListItemButton>
            )
          })}
        </List>
      </Collapse>
    </>
  )
}

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, selectedCompany, financialYear, isAdmin, hasPermission, logout, isSidebarOpen, toggleSidebar } = useAuth();
  
  const [entryOpen, setEntryOpen] = useState(true);
  const [masterOpen, setMasterOpen] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);
  const [accountsOpen, setAccountsOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);

  const entryModules = [
    'Advance',
    'Flour Out',
    'Flour Out Return',
    'Grind',
    'Papad In',
    'Packing',
    'Purchase',
    'Purchase Return',
    'Open',
    'Quotation',
    'Sales',
    'Sales Order',
    'Sales Export',
    'Sales Export Order',
    'Sales Return',
    'Stock Adjust',
    'Weight Conversion',
    'Voucher',
    'Vehicle Movement',  // ✅ NEW - LAST ITEM
  ];

  const masterModules = [
    'Item',
    'Item Group',
    'Deduction Sales',
    'Deduction Purchase',
    'Customer',
    'Suppliers',
    'Flour Mill',
    'Papad Company',
    'Weight',
    'Ledger Group',
    'Ledger',
    'Area',
    'City',
    'Consignee',
    'P.Trans',
    'Sender',
    'Transport',
    'Godown',
  ];


  const reportModules = [
    { name: 'Stock Report', path: '/report/stock-report', permission: 'Stock Report' },
    { name: 'Stock Status', path: '/report/stock-status', permission: 'Stock Status' },
    { name: 'Lot History', path: '/report/lot-history', permission: 'Lot History' },
    { name: 'Purchase Register', path: '/report/purchase-register', permission: 'Purchase Register' },
    { name: 'Purchase Return Register', path: '/report/purchase-return-register', permission: 'Purchase Return Register' },
    { name: 'Sales Register', path: '/report/sales-register', permission: 'Sales Register' },
    { name: 'Sales Return Register', path: '/report/sales-return-register', permission: 'Sales Return Register' },
    { name: 'Papad Ledger (Payment)', path: '/report/papad-ledger', permission: 'Papad Ledger' },
  ];

  // Accounts modules with paths
  const accountsModules = [
    { name: 'Day Book', path: '/reports/day-book', permission: 'Day Book' },
    { name: 'Trial Balance', path: '/reports/trial-balance', permission: 'Trial Balance' },
    { name: 'Balance Sheet', path: '/reports/balance-sheet', permission: 'Balance Sheet' },
    { name: 'Profit & Loss', path: '/reports/profit-loss', permission: 'Profit & Loss' },
    { name: 'Ledger', path: '/reports/ledger-statement', permission: 'Ledger Statement' },
    { name: 'Outstanding Summary', path: '/reports/outstanding-summary', permission: 'Outstanding Summary' },
    { name: 'Outstanding Details', path: '/reports/outstanding-details', permission: 'Outstanding Details' },
  ];

  const featuresModules = [
    { name: 'User', path: '/master/user-display', permission: 'User' },
  ];

  const companyModules = [
    { name: 'Select', path: '/company-select' },
    { name: 'Create', path: '/company-create' },
  ];

  const crudActions = ['Create', 'Display'];
  const masterActions = ['Create', 'Display'];

  const toggleDrawer = () => {
    if (document.activeElement) {
      document.activeElement.blur();
    }
    toggleSidebar();
  };

  const handleEntryClick = () => {
    setEntryOpen(!entryOpen);
  };

  const handleMasterClick = () => {
    setMasterOpen(!masterOpen);
  };

  const handleReportClick = () => {
    setReportOpen(!reportOpen);
  };

  const handleAccountsClick = () => {
    setAccountsOpen(!accountsOpen);
  };

  const handleFeaturesClick = () => {
    setFeaturesOpen(!featuresOpen);
  };

  const handleCompanyClick = () => {
    setCompanyOpen(!companyOpen);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/company-select');
  };

  const generatePath = (type, module, action) => {
    // Replace dots and special chars with hyphens, then collapse multiple hyphens
    const slug = module.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/\./g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
    const actionSlug = action.toLowerCase().replace(/\s+/g, '-').replace('/', '-')
    return `/${type}/${slug}-${actionSlug}`
  };

  const isDashboardActive = location.pathname === '/';

  return (
    <>
      {/* App Bar - Blue Theme */}
      <AppBar 
        position="fixed" 
        sx={{ 
          background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.secondary} 100%)`,
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 'bold',
              fontSize: '18px',
              letterSpacing: '0.5px',
            }}
          >
            BVC ERP
          </Typography>
          
          {/* Header Info */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 2 }}>
            {selectedCompany && (
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                <strong>Company:</strong> {selectedCompany.name}
              </Typography>
            )}
            {financialYear && (
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                <strong>FY:</strong> {financialYear}
              </Typography>
            )}
            {user && (
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                <strong>User:</strong> {user.username} ({user.role})
              </Typography>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      <Toolbar />
      
      {/* Sidebar - White & Blue Theme */}
      <Drawer 
        anchor="left" 
        variant="temporary"
        open={isSidebarOpen}
        onClose={toggleSidebar}
        disableRestoreFocus
        ModalProps={{
          keepMounted: true,
          disableAutoFocus: true,
          disableEnforceFocus: true,
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: 260,
            backgroundColor: themeColors.white,
            borderRight: `1px solid ${themeColors.lightBlue}`,
            overflowX: 'hidden',
          },
        }}
      >
        <Box sx={{ width: 260, pt: 2 }}>
          {/* Dashboard Link */}
          <ListItemButton 
            component={Link} 
            to="/" 
            onClick={toggleDrawer}
            sx={{ 
              justifyContent: 'flex-start',
              backgroundColor: isDashboardActive ? themeColors.primary : 'transparent',
              '&:hover': {
                backgroundColor: isDashboardActive ? themeColors.primary : themeColors.lightBlue,
              },
              py: 2
            }}
          >
            <DashboardIcon sx={{
              color: isDashboardActive ? themeColors.white : themeColors.primary,
              mr: 1
            }} />
            <ListItemText 
              primary="Dashboard"
              primaryTypographyProps={{
                fontSize: '14px',
                fontWeight: isDashboardActive ? 'bold' : 'normal',
                color: isDashboardActive ? themeColors.white : themeColors.textPrimary,
              }}
              sx={{ my: 0 }}
            />
          </ListItemButton>

          {/* Entry Section */}
          <ListItemButton
            onClick={handleEntryClick}
            sx={{
              minHeight: 48,
              borderTop: `1px solid ${themeColors.lightBlue}`,
              borderBottom: `1px solid ${themeColors.lightBlue}`,
              backgroundColor: themeColors.lighterBlue,
              px: 2,
            }}
          >
            <ListItemText
              primary="Entry"
              primaryTypographyProps={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: themeColors.primary,
              }}
              sx={{ mr: 1 }}
            />
            {entryOpen ? <ExpandLess sx={{ color: themeColors.primary }} /> : <ExpandMore sx={{ color: themeColors.primary }} />}
          </ListItemButton>
          <Collapse in={entryOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {entryModules.map((module) => (
                <EntryModuleItem
                  key={module}
                  module={module}
                  actions={crudActions}
                  generatePath={generatePath}
                  toggleDrawer={toggleDrawer}
                  hasPermission={hasPermission}
                  isAdmin={isAdmin}
                />
              ))}
            </List>
          </Collapse>

          {/* Master Section */}
          <ListItemButton
            onClick={handleMasterClick}
            sx={{
              minHeight: 48,
              borderTop: `1px solid ${themeColors.lightBlue}`,
              borderBottom: `1px solid ${themeColors.lightBlue}`,
              backgroundColor: themeColors.lighterBlue,
              px: 2,
            }}
          >
            <ListItemText
              primary="Master"
              primaryTypographyProps={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: themeColors.primary,
              }}
              sx={{ mr: 1 }}
            />
            {masterOpen ? <ExpandLess sx={{ color: themeColors.primary }} /> : <ExpandMore sx={{ color: themeColors.primary }} />}
          </ListItemButton>
          <Collapse in={masterOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {masterModules.map((module) => (
                <MasterModuleItem
                  key={module}
                  module={module}
                  actions={masterActions}
                  generatePath={generatePath}
                  toggleDrawer={toggleDrawer}
                  hasPermission={hasPermission}
                  isAdmin={isAdmin}
                />
              ))}
            </List>
          </Collapse>

          {/* Report Section - Only show if user has permission */}
          {(isAdmin || reportModules.some(r => hasPermission(r.permission, PERMISSION_TYPES.VIEW))) && (
            <ListItemButton onClick={handleReportClick}>
              <ListItemText 
                primary="Report" 
                primaryTypographyProps={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: themeColors.primary,
                }}
              />
              {reportOpen ? <ExpandLess sx={{ color: themeColors.primary }} /> : <ExpandMore sx={{ color: themeColors.primary }} />}
            </ListItemButton>
          )}
          <Collapse in={reportOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {reportModules
                .filter(report => isAdmin || hasPermission(report.permission, PERMISSION_TYPES.VIEW))
                .map((report) => {
                const isReportActive = location.pathname === report.path
                return (
                  <ListItemButton 
                    key={report.name} 
                    component={Link} 
                    to={report.path}
                    onClick={toggleDrawer}
                    sx={{ 
                      pl: 4,
                      backgroundColor: isReportActive ? themeColors.primary : 'transparent',
                      '&:hover': {
                        backgroundColor: isReportActive ? themeColors.primary : themeColors.lightBlue,
                      }
                    }}
                  >
                    <ListItemText 
                      primary={report.name}
                      primaryTypographyProps={{
                        fontSize: '12px',
                        fontWeight: isReportActive ? 'bold' : 'normal',
                        color: isReportActive ? themeColors.white : themeColors.textPrimary,
                      }}
                    />
                  </ListItemButton>
                )
              })}
            </List>
          </Collapse>

          {/* Accounts Section - Only show if user has permission */}
          {(isAdmin || accountsModules.some(a => hasPermission(a.permission, PERMISSION_TYPES.VIEW))) && (
            <ListItemButton onClick={handleAccountsClick}>
              <ListItemText 
                primary="Accounts" 
                primaryTypographyProps={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: themeColors.primary,
                }}
              />
              {accountsOpen ? <ExpandLess sx={{ color: themeColors.primary }} /> : <ExpandMore sx={{ color: themeColors.primary }} />}
            </ListItemButton>
          )}
          <Collapse in={accountsOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {accountsModules
                .filter(module => isAdmin || hasPermission(module.permission, PERMISSION_TYPES.VIEW))
                .map((module) => {
                const isAccountActive = location.pathname === module.path
                return (
                  <ListItemButton 
                    key={module.name} 
                    component={Link} 
                    to={module.path}
                    onClick={toggleDrawer}
                    sx={{ 
                      pl: 4,
                      backgroundColor: isAccountActive ? themeColors.primary : 'transparent',
                      '&:hover': {
                        backgroundColor: isAccountActive ? themeColors.primary : themeColors.lightBlue,
                      }
                    }}
                  >
                    <ListItemText 
                      primary={module.name}
                      primaryTypographyProps={{
                        fontSize: '12px',
                        fontWeight: isAccountActive ? 'bold' : 'normal',
                        color: isAccountActive ? themeColors.white : themeColors.textPrimary,
                      }}
                    />
                  </ListItemButton>
                )
              })}
            </List>
          </Collapse>

          {/* Features Section */}
          <ListItemButton onClick={handleFeaturesClick}>
            <ListItemText 
              primary="Features" 
              primaryTypographyProps={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: themeColors.primary,
              }}
            />
            {featuresOpen ? <ExpandLess sx={{ color: themeColors.primary }} /> : <ExpandMore sx={{ color: themeColors.primary }} />}
          </ListItemButton>
          <Collapse in={featuresOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {featuresModules
                .filter(module => isAdmin || hasPermission(module.permission, PERMISSION_TYPES.VIEW))
                .map((module) => (
                <ListItemButton 
                  key={module.name} 
                  component={Link} 
                  to={module.path}
                  onClick={toggleDrawer}
                  sx={{ pl: 4 }}
                >
                  <ListItemText 
                    primary={module.name}
                    primaryTypographyProps={{
                      fontSize: '12px',
                      color: themeColors.textPrimary,
                    }}
                  />
                </ListItemButton>
              ))}
            </List>
          </Collapse>

          {/* Company Section */}
          <ListItemButton onClick={handleCompanyClick}>
            <ListItemText 
              primary="Company" 
              primaryTypographyProps={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: themeColors.primary,
              }}
            />
            {companyOpen ? <ExpandLess sx={{ color: themeColors.primary }} /> : <ExpandMore sx={{ color: themeColors.primary }} />}
          </ListItemButton>
          <Collapse in={companyOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {companyModules.map((module) => (
                <ListItemButton 
                  key={module.name} 
                  component={Link} 
                  to={module.path}
                  onClick={toggleDrawer}
                  sx={{ pl: 4 }}
                >
                  <ListItemText 
                    primary={module.name}
                    primaryTypographyProps={{
                      fontSize: '12px',
                      color: themeColors.textPrimary,
                    }}
                  />
                </ListItemButton>
              ))}
            </List>
          </Collapse>

          {/* Logout Button */}
          <ListItemButton 
            onClick={handleLogout}
            sx={{ 
              borderTop: `1px solid ${themeColors.lightBlue}`,
              mt: 2,
            }}
          >
            <LogoutIcon sx={{ mr: 1, color: themeColors.primary }} />
            <ListItemText 
              primary="Logout"
              primaryTypographyProps={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: themeColors.primary,
              }}
            />
          </ListItemButton>
        </Box>
      </Drawer>
    </>
  )
}

export default Navigation
