import api from "../config/api";

//export default api;

/* ===========================
   🔹 COMMON HELPER
=========================== */
// SAFE ARRAY
export const safeArray = (data) =>
  Array.isArray(data) ? data : [];

// USERS
export const getUsers = (companyId) =>
  api.get("/auth/users", { companyId });

// LOGIN
export const login = (data) =>
  api.post("/auth/login", data);

// DELETE MASTER (generic)
export const deleteMaster = (type, id) =>
  api.delete(`/masters/${type}`, { id });

// SQL (ONLY if needed)
export const executeQuery = (sql, params = []) =>
  api.post("/db/query", { sql, params });

export const executeStatement = (sql, params = []) =>
  api.post("/db/execute", { sql, params });
/* ===========================
   🔹 COMPANY (SPECIAL ROUTE)
=========================== */
export const getCompanies = () => api.get("/companies");
export const getCompany = (id) => api.get(`/companies/${id}`);
export const createCompany = (data) => api.post("/companies", data);
export const updateCompany = (id, data) => api.put("/companies", { id, ...data });
export const deleteCompany = (id) => api.delete("/companies", { id });

/* ===========================
   🔹 CUSTOMERS
=========================== */
export const getCustomers = () => api.get("/masters/customers");
export const createCustomer = (data) => api.post("/masters/customers", data);
export const updateCustomer = (id, data) => api.put("/masters/customers", { id, ...data });
export const deleteCustomer = (id) => api.delete("/masters/customers", { id });

/* ===========================
   🔹 SUPPLIERS
=========================== */
export const getSuppliers = () => api.get("/masters/suppliers");
export const createSupplier = (data) => api.post("/masters/suppliers", data);
export const updateSupplier = (id, data) => api.put("/masters/suppliers", { id, ...data });
export const deleteSupplier = (id) => api.delete("/masters/suppliers", { id });

/* ===========================
   🔹 ITEMS
=========================== */
export const getItems = () => api.get("/masters/items");
export const createItem = (data) => api.post("/masters/items", data);
export const updateItem = (id, data) => api.put("/masters/items", { id, ...data });
export const deleteItem = (id) => api.delete("/masters/items", { id });

/* ===========================
   🔹 ITEM GROUPS
=========================== */
export const getItemGroups = () => api.get("/masters/item_groups");
export const createItemGroup = (data) => api.post("/masters/item_groups", data);
export const deleteItemGroup = (id) => api.delete("/masters/item_groups", { id });

/* ===========================
   🔹 AREAS
=========================== */
export const getAreas = () => api.get("/masters/areas");
export const createArea = (data) => api.post("/masters/areas", data);
export const updateArea = (id, data) => api.put("/masters/areas", { id, ...data });
export const deleteArea = (id) => api.delete("/masters/areas", { id });

/* ===========================
   🔹 CITIES
=========================== */
export const getCities = () => api.get("/masters/cities");
export const createCity = (data) => api.post("/masters/cities", data);
export const updateCity = (id, data) => api.put("/masters/cities", { id, ...data });
export const deleteCity = (id) => api.delete("/masters/cities", { id });

/* ===========================
   🔹 LEDGER GROUPS
=========================== */
export const getLedgerGroups = () => api.get("/masters/ledger_groups");
export const createLedgerGroup = (data) => api.post("/masters/ledger_groups", data);
export const deleteLedgerGroup = (id) => api.delete("/masters/ledger_groups", { id });

/* ===========================
   🔹 LEDGERS
=========================== */
export const getLedgers = () => api.get("/masters/ledgers");
export const createLedger = (data) => api.post("/masters/ledgers", data);
export const updateLedger = (id, data) => api.put("/masters/ledgers", { id, ...data });
export const deleteLedger = (id) => api.delete("/masters/ledgers", { id });

/* ===========================
   🔹 WEIGHTS
=========================== */
export const getWeights = () => api.get("/masters/weights");
export const createWeight = (data) => api.post("/masters/weights", data);
export const deleteWeight = (id) => api.delete("/masters/weights", { id });

/* ===========================
   🔹 FLOUR MILLS
=========================== */
export const getFlourMills = () => api.get("/masters/flour_mills");
export const createFlourMill = (data) => api.post("/masters/flour_mills", data);
export const deleteFlourMill = (id) => api.delete("/masters/flour_mills", { id });

/* ===========================
   🔹 PAPAD COMPANIES
=========================== */
export const getPapadCompanies = () => api.get("/masters/papad_companies");
export const createPapadCompany = (data) => api.post("/masters/papad_companies", data);
export const deletePapadCompany = (id) => api.delete("/masters/papad_companies", { id });

/* ===========================
   🔹 CONSIGNEES
=========================== */
export const getConsignees = () => api.get("/masters/consignees");
export const createConsignee = (data) => api.post("/masters/consignees", data);
export const deleteConsignee = (id) => api.delete("/masters/consignees", { id });

/* ===========================
   🔹 SENDERS
=========================== */
export const getSenders = () => api.get("/masters/senders");
export const createSender = (data) => api.post("/masters/senders", data);
export const deleteSender = (id) => api.delete("/masters/senders", { id });

/* ===========================
   🔹 TRANSPORTS
=========================== */
export const getTransports = () => api.get("/masters/transports");
export const createTransport = (data) => api.post("/masters/transports", data);
export const deleteTransport = (id) => api.delete("/masters/transports", { id });

/* ===========================
   🔹 PTRANS
=========================== */
export const getPTrans = () => api.get("/masters/ptrans");
export const createPTrans = (data) => api.post("/masters/ptrans", data);
export const updatePTrans = (id, data) => api.put("/masters/ptrans", { id, ...data });
export const deletePTrans = (id) => api.delete("/masters/ptrans", { id });

/* ===========================
   🔹 PURCHASES
=========================== */
export const getPurchases = () => api.get("/purchases");
export const createPurchase = (data) => api.post("/purchases", data);

/* ===========================
   🔹 SALES
=========================== */
export const getSales = () => api.get("/sales");
export const createSale = (data) => api.post("/sales", data);

/* ===========================
   🔹 REPORTS
=========================== */
export const getDayBookReport = (params) =>
  api.get("/reports/daybook", params);

export const getTrialBalanceReport = () =>
  api.get("/reports/trial_balance");

export const getProfitLossReport = () =>
  api.get("/reports/profit_loss");

export const getLedgerStatementReport = (params) =>
  api.get("/reports/ledger_statement", params);

export const getOutstandingSummaryReport = () =>
  api.get("/reports/outstanding_summary");

export const getOutstandingDetailsReport = () =>
  api.get("/reports/outstanding_details");

export const getMasters = (type) => {
  const map = {
    item_master: "items",
    customer_master: "customers",
    supplier_master: "suppliers",
    area_master: "areas",
    city_master: "cities",
    transport_master: "transports",
    weight_master: "weights",
    papad_company_master: "papad_companies",
    flour_mill_master: "flour_mills",
  };

  const finalType = map[type] || type;

  return api.get(`/masters/${finalType}`);
};
export default {  api,  getMasters, safeArray};

/*import api from '../config/api'

export default api
export * from '../config/api'

export const safeArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
};
// ==========================
// HELPER FUNCTIONS (IMPORTANT)
// ==========================

// Customers
export const getCustomers = () =>
  api.get("/masters/customer");

export const createCustomer = (data) =>
  api.post("/masters/customer", data);

export const updateCustomer = (id, data) =>
  api.put("/masters/customer", { id, ...data });

export const deleteCustomer = (id) =>
  api.delete("/masters/customer", { id: Number(id) });

// Suppliers
export const getSuppliers = () =>
  api.get("/masters/supplier");

export const createSupplier = (data) =>
  api.post("/masters/supplier", data);

export const updateSupplier = (id, data) =>
  api.put("/masters/supplier", { id, ...data });

export const deleteSupplier = (id) =>
  api.delete("/masters/supplier", { id: Number(id) });

// Items
export const getItems = () =>
  api.get("/masters/item");

export const createItem = (data) =>
  api.post("/masters/item", data);

export const updateItem = (id, data) =>
  api.put("/masters/item", { id, ...data });

export const deleteItem = (id) =>
  api.delete("/masters/item", { id: Number(id) });


// Areas
export const getAreas = () =>
  api.get("/masters/area");

// Cities
export const getCities = () =>
  api.get("/masters/city");

// Purchases
export const getPurchases = () =>
  api.get("/entries/purchase");

export const createPurchase = (formData, items, totals) =>
  api.post("/entries/purchase", { formData, items, totals });

// Sales
export const getSales = () =>
  api.get("/entries/sales");

export const createSale = (formData, items, totals) =>
  api.post("/entries/sales", { formData, items, totals });
// Ledgers
export const getLedgers = () =>
  api.get("/masters/ledger");

export const deleteLedger = (id) =>
  api.delete("/masters/ledger", { id: Number(id) });

// Ledger Groups
export const getLedgerGroups = () =>
  api.get("/masters/ledger_group");

// Consignees
export const getConsignees = () =>
  api.get("/masters/consignee");

// Transport
export const getTransports = () =>
  api.get("/masters/transport");

// Weights
export const getWeights = () =>
  api.get("/masters/weight");       
// Papad Companies
export const getPapadCompanies = () =>
  api.get("/masters/papadcompany");

// Flour Mills
export const getFlourMills = () =>
  api.get("/masters/flourmill");      

// Companies
export const getCompanies = () =>
  api.get("/companies");

export const createCompany = (data) =>
  api.post("/companies", data);

export const updateCompany = (id, data) =>
  api.put("/companies", { id, ...data });

export const deleteCompany = (id) =>
  api.delete("/companies", { id: Number(id) });       */



/*import { invoke } from '@tauri-apps/api/tauri';
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
*/
