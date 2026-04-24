const isTauri = typeof window !== "undefined" && window.__TAURI__;

const BASE_URL = isTauri
  ? "http://localhost:5000"
  : import.meta.env.VITE_API_URL || "http://localhost:5000";

// ✅ BASE_URL must NOT include /api — it is added per-request below
export async function api(endpoint, options = {}) {
  if (!endpoint || typeof endpoint !== "string") {
    console.error("❌ Invalid endpoint:", endpoint);
    return null;
  }

  // Ensure leading slash
  if (!endpoint.startsWith("/")) {
    endpoint = "/" + endpoint;
  }

  // ✅ Prevent double /api — only prepend if not already present
  const cleanEndpoint = endpoint.startsWith("/api")
    ? endpoint
    : `/api${endpoint}`;

  const url = `${BASE_URL}${cleanEndpoint}`;
  console.log("🌐 FINAL URL:", url);

  try {
    const res = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    // ✅ Null-safe JSON parse
    if (!res.ok) {
      console.error("❌ API HTTP error:", res.status, res.statusText);
      const text = await res.text();
      console.error("❌ Response body:", text);
      return { success: false, data: null, message: `HTTP ${res.status}: ${res.statusText}` };
    }

    return await res.json();
  } catch (err) {
    console.error("🔥 API FAILED:", err.message);
    return { success: false, data: null, message: err.message };
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

