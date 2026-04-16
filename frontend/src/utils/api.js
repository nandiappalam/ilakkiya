import { invoke } from '@tauri-apps/api/tauri';
import { safeArray } from './safeArray.js';
const isTauri = typeof window !== 'undefined' && !!window.__TAURI__;

// ✅ Same domain (Render)
const BASE_URL = "";

// 🔥 Generic API call for web
async function apiCall(endpoint, method = "GET", data = null) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json"
    }
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const res = await fetch(`${BASE_URL}/api/${endpoint}`, options);

  if (!res.ok) {
    throw new Error(`API Error: ${res.status}`);
  }

  return res.json();
}

// 🔥 Hybrid function (Tauri + Web)
async function safeInvoke(cmd, args = {}) {
  if (isTauri) {
    try {
      return await invoke(cmd, args);
    } catch (error) {
      console.error(`Tauri error: ${cmd}`, error);
      throw error;
    }
  }

  // 🌐 WEB MODE (Render)
  switch (cmd) {

    case 'get_masters':
      return apiCall(`masters/${args.table}`);

    case 'create_master':
      return apiCall(`masters/${args.table}`, "POST", args.data);

    case 'delete_master':
      return apiCall(`masters/${args.table}/${args.id}`, "DELETE");

    case 'login':
      return apiCall(`auth/login`, "POST", args);

    case 'get_next_lot':
      return apiCall(`stock/next-lot`);

    case 'get_available_lots':
      return apiCall(`stock/available/${args.itemId}`);

    default:
      throw new Error(`Unknown command: ${cmd}`);
  }
}

// 🔥 Main API object
const api = {
  getMasters: (table) => safeInvoke('get_masters', { table }),
  createMaster: (table, data) => safeInvoke('create_master', { table, data }),
  deleteMaster: (table, id) => safeInvoke('delete_master', { table, id }),

  login: (username, password, companyId) =>
    safeInvoke('login', { username, password, companyId }),

  getNextLot: () => safeInvoke('get_next_lot'),

  getAvailableLots: (itemId) =>
    safeInvoke('get_available_lots', { itemId }),
};

// Add this after api object creation


// 🔥 Specific wrappers (your app usage)

api.getCustomers = () => api.getMasters('customer_master');
api.getSuppliers = () => api.getMasters('supplier_master');
api.getAreas = () => api.getMasters('area_master');
api.getLedgerGroups = () => api.getMasters('ledgergroupmaster');
api.getLedgers = () => api.getMasters('ledgermaster');

api.deleteCustomer = (id) => api.deleteMaster('customer_master', id);
api.deleteLedger = (id) => api.deleteMaster('ledgermaster', id);
export const createGrain = (data) =>
  isTauri
    ? safeInvoke("create_grain", { data })   // optional (if Tauri supports)
    : apiCall("grains", "POST", data);

api.createGrain = createGrain;


export { safeArray };
export default api;
