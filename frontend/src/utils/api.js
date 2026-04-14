import { invoke } from '@tauri-apps/api/tauri'

const isTauri = typeof window !== 'undefined' && !!window.__TAURI__;

async function safeInvoke(cmd, args = {}) {
  if (!isTauri) {
    console.warn(`[MOCK API] ${cmd}`, args);
    return mockResponse(cmd, args);
  }
  try {
    return await invoke(cmd, args);
  } catch (error) {
    console.error(`Tauri command failed: ${cmd}`, error);
    return mockResponse(cmd, args);
  }
}

function mockResponse(cmd, args = {}) {
  switch (cmd) {
    case 'get_masters':
      return { success: true, data: [] };
    case 'delete_master':
      return { success: true };
    case 'create_master':
      return { success: true, data: { id: 1 } };
    case 'login':
      return { success: true };
    case 'get_next_lot':
      return 1;
    case 'get_available_lots':
      return [];
    default:
      return { success: false, data: [], message: 'Command not found' };
  }
}

const api = {
  getMasters: async (table) => safeInvoke('get_masters', { table }),
  createMaster: async (table, data) => safeInvoke('create_master', { table, data }),
  deleteMaster: async (table, id) => safeInvoke('delete_master', { table, id }),
  login: async (username, password, companyId) => safeInvoke('login', { username, password, companyId }),
  getNextLot: async () => safeInvoke('get_next_lot'),
  getAvailableLots: async (itemId) => safeInvoke('get_available_lots', { itemId }),
};

// Specific API wrappers
api.getCustomers = () => api.getMasters('customer_master');
api.deleteCustomer = (id) => api.deleteMaster('customer_master', id);
api.getFlourMills = () => api.getMasters('flour_mill_master');
api.getGodowns = () => api.getMasters('godown_master');
api.getAreas = () => api.getMasters('area_master');
api.getSuppliers = () => api.getMasters('supplier_master');
api.getLedgerGroups = () => api.getMasters('ledgergroupmaster');
api.getLedgers = () => api.getMasters('ledgermaster');
api.deleteLedger = (id) => api.deleteMaster('ledgermaster', id);
api.getPapadCompanies = () => api.getMasters('papad_company_master');
api.getConsignees = () => api.getMasters('consignee_master');
api.getSenders = () => api.getMasters('sender_master');
api.getTransports = () => api.getMasters('transport_master');
api.getDeductionSales = () => api.getMasters('deduction_sales');
api.getDeductionPurchase = () => api.getMasters('deduction_purchase');

import { safeArray } from './safeArray.js';
export { safeArray };

export default api;

