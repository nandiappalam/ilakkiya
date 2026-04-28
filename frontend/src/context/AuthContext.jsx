import React, { createContext, useContext, useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api';

// Check if running in Tauri environment (Tauri v1 uses window.__TAURI__)
const isRunningInTauri = () => {
  try {
    return typeof window !== 'undefined' && window.__TAURI__ !== undefined;
  } catch (e) {
    return false;
  }
};

const AuthContext = createContext(null);

// Page types
export const PAGE_TYPES = {
  CREATE: 'Create',
  DISPLAY: 'Display'
};

// Permission action types
export const PERMISSION_ACTIONS = {
  VIEW: 'can_view',
  CREATE: 'can_create',
  EDIT: 'can_edit',
  DELETE: 'can_delete',
  PRINT: 'can_print'
};

// Permission types (for permission_type field)
export const PERMISSION_TYPES = {
  FULL: 'Full',
  CREATE: 'Create',
  EDIT: 'Edit',
  DELETE: 'Delete',
  VIEW: 'View'
};

// Module categories - with full company modules
export const MODULE_CATEGORIES = {
  // Master Modules
  MASTER: [
    'Item', 'Item Group', 'Customer', 'Supplier', 'Flour Mill', 'Papad Company',
    'Weight', 'Ledger Group', 'Ledger', 'Area', 'City', 'Consignee',
    'P.Trans', 'Sender', 'Transport', 'Deduction Sales', 'Deduction Purchase'
  ],
  // Entry Modules
  ENTRY: [
    'Advance', 'Flour Out', 'Flour Out Return', 'Grind', 'Papad In', 'Packing',
    'Purchase', 'Purchase Return', 'Open', 'Quotation', 'Sales', 'Sales Order',
    'Sales Export', 'Sales Export Order', 'Sales Return', 'Stock Adjust', 'Weight Conversion'
  ],
  // Report Modules
  REPORTS: [
    'Stock Report', 'Stock Status', 'Lot History', 'Purchase Register',
    'Purchase Return Register', 'Sales Register', 'Sales Return Register', 'Papad Ledger'
  ],
  // Accounts Modules
  ACCOUNTS: [
    'Day Book', 'Trial Balance', 'Balance Sheet', 'Profit & Loss',
    'Ledger Statement', 'Outstanding Summary', 'Outstanding Details'
  ],
  // Features Modules
  FEATURES: [
    'User', 'Financial Year'
  ],
  // Company Modules - Full structure
  COMPANY: [
    'Company Select', 'Company Create', 'Company Alter', 'Company Backup', 'Company Attach'
  ]
};

// Features menu items with page-level permissions
export const FEATURES_MENU = [
  { name: 'User', path: '/master/user-display', page: 'Display', icon: '👤' },
  { name: 'User', path: '/master/user-create', page: 'Create', icon: '👤' },
  { name: 'Financial Year', path: '/features/financial-year', page: 'Display', icon: '📅' },
  { name: 'Financial Year', path: '/features/financial-year-create', page: 'Create', icon: '📅' }
];

// Company menu items with page-level permissions
export const COMPANY_MENU = [
  { name: 'Select Company', path: '/company-select', page: 'Select', icon: '🏢' },
  { name: 'Create Company', path: '/company-create', page: 'Create', icon: '➕' },
  { name: 'Alter Company', path: '/company-alter/:id', page: 'Alter', icon: '✏️' },
  { name: 'Company Backup', path: '/company-backup', page: 'Backup', icon: '💾' },
  { name: 'Company Attach', path: '/company-attach', page: 'Attach', icon: '🔗' }
];

// Default permissions for admin - full access to all modules and pages
export const ADMIN_PERMISSIONS = [];

// Get all modules as a flat array
export const getAllModules = () => Object.values(MODULE_CATEGORIES).flat();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loginHistoryId, setLoginHistoryId] = useState(null);
const [financialYear, setFinancialYear] = useState('2024-2025');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  // Check for stored session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('erp_user');
    const storedCompany = localStorage.getItem('erp_company');
    const storedSelectedCompany = localStorage.getItem('erp_selected_company');
    const storedPermissions = localStorage.getItem('erp_permissions');
    const storedIsAdmin = localStorage.getItem('erp_isAdmin');
    const storedLoginHistoryId = localStorage.getItem('erp_login_history_id');
    const storedFinancialYear = localStorage.getItem('erp_financial_year');

    if (storedUser && storedSelectedCompany) {
      setUser(JSON.parse(storedUser));
      setCompany(JSON.parse(storedCompany));
      setSelectedCompany(JSON.parse(storedSelectedCompany));
      setIsAdmin(storedIsAdmin === 'true');
      setLoginHistoryId(storedLoginHistoryId);
      if (storedPermissions) {
        setPermissions(JSON.parse(storedPermissions));
      }
      if (storedFinancialYear) {
        setFinancialYear(storedFinancialYear);
      }
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (loginData) => {
    try {
      // Guard against null/invalid login data
      if (!loginData || typeof loginData !== 'object') {
        console.error('Login failed: invalid response', loginData);
        return { success: false, message: 'Invalid login response from server' };
      }

      // Extract data from login response
      const userData = loginData.user || {
        id: loginData.user_id,
        username: loginData.username,
        role: loginData.role,
      };
      
      const companyData = loginData.company || {
        id: loginData.company_id,
        name: loginData.company_name,
      };

      // Set state
      setUser(userData);
      setCompany(companyData);
      setSelectedCompany(companyData);
      setIsAdmin(loginData.isAdmin || loginData.role === 'Admin' || loginData.role === 'admin');
      setPermissions(loginData.permissions || []);
      setLoginHistoryId(loginData.login_history_id);

      // Store in localStorage for persistence
      localStorage.setItem('erp_user', JSON.stringify(userData));
      localStorage.setItem('erp_company', JSON.stringify(companyData));
      localStorage.setItem('erp_selected_company', JSON.stringify(companyData));
      localStorage.setItem('erp_permissions', JSON.stringify(loginData.permissions || []));
      localStorage.setItem('erp_isAdmin', String(loginData.isAdmin || loginData.role === 'Admin' || loginData.role === 'admin'));
      localStorage.setItem('erp_login_history_id', String(loginData.login_history_id || ''));

      return { success: true };
    } catch (error) {
      console.error('Login error in context:', error);
      return { success: false, message: error.message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      if (loginHistoryId) {
        // Try Tauri invoke first, fall back to fetch for dev mode
        const runningInTauri = isRunningInTauri();
        if (runningInTauri) {
          try {
            await invoke('logout', { login_history_id: loginHistoryId });
          } catch (e) {
            console.warn('Tauri logout failed:', e);
          }
        } else {
          await fetch('/api/auth/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login_history_id: loginHistoryId })
          });
        }
      }
    } catch (error) {
      console.error('Logout error:', error);
    }

    // Clear state
    setUser(null);
    setCompany(null);
    setSelectedCompany(null);
    setPermissions([]);
    setIsAdmin(false);
    setLoginHistoryId(null);

    // Clear localStorage
    localStorage.removeItem('erp_user');
    localStorage.removeItem('erp_company');
    localStorage.removeItem('erp_selected_company');
    localStorage.removeItem('erp_permissions');
    localStorage.removeItem('erp_isAdmin');
    localStorage.removeItem('erp_login_history_id');
  };

  // Select company (before login)
  const selectCompany = (companyData) => {
    setSelectedCompany(companyData);
    localStorage.setItem('erp_selected_company', JSON.stringify(companyData));
  };

  // Check if user has permission for a specific module, page and action
  // moduleName: e.g., 'Purchase'
  // pageName: e.g., 'Create' or 'Display' 
  // action: e.g., 'can_view', 'can_create', 'can_edit', 'can_delete', 'can_print'
  const hasPermission = (moduleName, pageName = 'Display', action = 'can_view') => {
    // Admin has full access
    if (isAdmin) return true;

    // Check if user has the permission for the specific module, page and action
    const modulePerm = permissions.find(
      p => (p.module_name === moduleName || p.module_name.toLowerCase() === moduleName.toLowerCase()) &&
           (p.page_name === pageName || p.page_name.toLowerCase() === pageName.toLowerCase())
    );

    if (!modulePerm) return false;

    // Return the specific action permission
    return modulePerm[action] === 1;
  };

  // Get user's permitted modules for a specific page and action
  const getPermittedModules = (category, pageName = 'Display', action = 'can_view') => {
    if (isAdmin) return MODULE_CATEGORIES[category] || [];
    
    const categoryModules = MODULE_CATEGORIES[category] || [];
    return categoryModules.filter(module => 
      permissions.some(p => 
        (p.module_name === module || p.module_name.toLowerCase() === module.toLowerCase()) &&
        (p.page_name === pageName || p.page_name.toLowerCase() === pageName.toLowerCase()) &&
        p[action] === 1
      )
    );
  };

  // Get all permissions for a specific module
  const getModulePermissions = (moduleName, pageName = 'Display') => {
    if (isAdmin) {
      return {
        can_view: 1,
        can_create: 1,
        can_edit: 1,
        can_delete: 1,
        can_print: 1
      };
    }
    
    const modulePerm = permissions.find(
      p => (p.module_name === moduleName || p.module_name.toLowerCase() === moduleName.toLowerCase()) &&
           (p.page_name === pageName || p.page_name.toLowerCase() === pageName.toLowerCase())
    );

    return modulePerm || {
      can_view: 0,
      can_create: 0,
      can_edit: 0,
      can_delete: 0,
      can_print: 0
    };
  };

  // Update financial year
  const updateFinancialYear = (year) => {
    setFinancialYear(year);
    localStorage.setItem('erp_financial_year', year);
  };

const value = {
    user,
    company,
    selectedCompany,
    permissions,
    isAdmin,
    loading,
    financialYear,
    isSidebarOpen,
    toggleSidebar,
    login,
    logout,
    selectCompany,
    hasPermission,
    getPermittedModules,
    getModulePermissions,
    updateFinancialYear,
    setSelectedCompany
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
