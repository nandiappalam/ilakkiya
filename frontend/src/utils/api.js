const isTauri = typeof window !== "undefined" && window.__TAURI__;

const BASE_URL = isTauri
  ? "http://localhost:5000"
  : "http://localhost:5000"; // no trailing /api

// Generic api handler - PREVENTS double /api
export async function api(endpoint, options = {}) {
  if (!endpoint || typeof endpoint !== "string") {
    console.error("❌ Invalid endpoint:", endpoint);
    return null;
  }
  try {
    // ✅ prevent double /api
    const cleanEndpoint = endpoint.startsWith("/api")
      ? endpoint
      : `/api${endpoint}`;

    const res = await fetch(`${BASE_URL}${cleanEndpoint}`, {

      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    if (!res.ok) {
      console.error("API ERROR:", res.status, await res.text());
      return null; // ❗ NO THROW
    }

    return await res.json();
  } catch (err) {
    console.error("🔥 API FAILED:", err.message);
    return null; // ❗ GRACEFUL
  }
}

// Generic getMasters
export async function getMasters(type) {
  return api(`/masters/${type}`);
}

// CRUD functions  
export const createMaster = (table, data) => api(`masters/${table}`, { method: 'POST', body: data });
export const updateMaster = (table, id, data) => api(`masters/${table}/${id}`, { method: 'PUT', body: data });
export const deleteMaster = (table, id) => api(`masters/${table}/${id}`, { method: 'DELETE' });

// Specific master getters
export const getAreas = () => getMasters('areas');
export const getCities = () => getMasters('cities');
export const getCustomers = () => getMasters('customers');
export const getSuppliers = () => getMasters('suppliers');
export const getItems = () => getMasters('items');
export const getItemGroups = () => getMasters('item_groups');
export const getLedgerGroups = () => getMasters('ledger_groups');
export const getWeights = () => getMasters('weights');
export const getTransports = () => getMasters('transports');
export const getSenders = () => getMasters('senders');
export const getConsignees = () => getMasters('consignees');
export const getPapadCompanies = () => getMasters('papad_companies');

// Fallback getNextLot
export async function getNextLot() {
  const result = await api('/lots/next');
  return result || { lot_no: 'LOT001' };
}

// Object export for compatibility
export default {
  api,
  getMasters,
  createMaster,
  updateMaster,
  deleteMaster,
  getAreas,
  getCities,
  getCustomers,
  getSuppliers,
  getItems,
  getItemGroups,
  getLedgerGroups,
  getWeights,
  getTransports,
  getSenders,
  getConsignees,
  getPapadCompanies,
  getNextLot
};

