// API Configuration
// Centralized API configuration for ERP Application

// Base URL for API calls
// Use relative path for Vite proxy - DO NOT use hardcoded localhost
// Vite proxy will forward /api requests to the backend server
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// API Endpoints
export const API_ENDPOINTS = {
  // Master Modules
  masters: {
    customer: `${API_BASE_URL}/masters/customer_master`,
    supplier: `${API_BASE_URL}/masters/supplier_master`,
    item: `${API_BASE_URL}/masters/item_master`,
    itemGroup: `${API_BASE_URL}/masters/item_group`,
    area: `${API_BASE_URL}/masters/area_master`,
    city: `${API_BASE_URL}/masters/city_master`,
    ledger: `${API_BASE_URL}/masters/ledger_master`,
    ledgerGroup: `${API_BASE_URL}/masters/ledger_group`,
    consignee: `${API_BASE_URL}/masters/consignee_master`,
    pTrans: `${API_BASE_URL}/masters/ptrans_master`,
    flourMill: `${API_BASE_URL}/masters/flourmill_master`,
    papadCompany: `${API_BASE_URL}/masters/papadcompany_master`,
    sender: `${API_BASE_URL}/masters/sender_master`,
    transport: `${API_BASE_URL}/masters/transport_master`,
    weight: `${API_BASE_URL}/masters/weight_master`,
    deductionSales: `${API_BASE_URL}/masters/deduction_sales`,
    deductionPurchase: `${API_BASE_URL}/masters/deduction_purchase`,
  },
  
  // Entry Modules
  entries: {
    sales: `${API_BASE_URL}/entries/sales`,
    purchase: `${API_BASE_URL}/entries/purchase`,
    salesReturn: `${API_BASE_URL}/entries/sales_return`,
    purchaseReturn: `${API_BASE_URL}/entries/purchase_return`,
    advance: `${API_BASE_URL}/entries/advance`,
    flourOut: `${API_BASE_URL}/entries/flour_out`,
    flourOutReturn: `${API_BASE_URL}/entries/flour_out_return`,
    grind: `${API_BASE_URL}/entries/grind`,
    papadIn: `${API_BASE_URL}/entries/papad_in`,
    packing: `${API_BASE_URL}/entries/packing`,
    quotation: `${API_BASE_URL}/entries/quotation`,
    stockAdjust: `${API_BASE_URL}/entries/stock_adjust`,
    weightConversion: `${API_BASE_URL}/entries/weight_conversion`,
    salesExport: `${API_BASE_URL}/entries/sales_export`,
    salesExportOrder: `${API_BASE_URL}/entries/sales_export_order`,
  }
};

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
};

// Default headers
export const getHeaders = () => ({
  'Content-Type': 'application/json',
});

// API Helper functions
export const api = {
  // GET request
  get: async (endpoint) => {
    const response = await fetch(endpoint, {
      method: HTTP_METHODS.GET,
      headers: getHeaders(),
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
  },

  // POST request
  post: async (endpoint, data) => {
    const response = await fetch(endpoint, {
      method: HTTP_METHODS.POST,
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
  },

  // PUT request
  put: async (endpoint, data) => {
    const response = await fetch(endpoint, {
      method: HTTP_METHODS.PUT,
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
  },

  // DELETE request
  delete: async (endpoint) => {
    const response = await fetch(endpoint, {
      method: HTTP_METHODS.DELETE,
      headers: getHeaders(),
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
  },
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  HTTP_METHODS,
  getHeaders,
  api,
};
