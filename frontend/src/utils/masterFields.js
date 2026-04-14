// Dropdown mappings (API tables)
export const MASTER_FIELD_TYPES = {
  item_group: "item_groups",
  ledger: "ledgers",
  sender: "sender_master",
  p_trans: "p_trans",
  weight: "weights",
  items: "items",
  customers: "customers",
  suppliers: "suppliers",
  godowns: "godowns",
  transport: "transport",
  ledger_groups: "ledger_groups",
  areas: "areas",
  cities: "cities",
  statuses: "statuses", // Assume statuses table or hardcoded
  item_types: "item_types", // Assume
};

// Input type overrides
export const FIELD_TYPES = {
  tax: "number",
  ed_percent: "number",
  phone: "number",
  address: "textarea",
  value: "number",
  wages_kg: "number",
  opening_balance: "number",
  limit_days: "number",
  limit_amount: "number",
};

// 🔥 MASTER CONFIG - Config-driven forms for ALL modules (Safe updates only)
export const MASTER_CONFIG = {
  item: {
    table: 'item_master',
    sections: [ // ✅ Perfect - leave as-is
      { title: "Basic Info", fields: [{ name: "item_code", label: "Item Code", type: "text", readonly: true }, { name: "item_name", label: "Item Name", type: "text", required: true }, { name: "print_name", label: "Print Name", type: "text" }] },
      { title: "Classification", fields: [{ name: "item_group", label: "Item Group", masterType: "item_groups" }, { name: "type", label: "Type", masterType: "item_types" }] },
      { title: "Tax Details", fields: [{ name: "tax", label: "Tax %", type: "number" }, { name: "hsn_code", label: "HSN Code", type: "text" }, { name: "ed_percent", label: "ED %", type: "number" }] },
      { title: "Other", fields: [{ name: "status", label: "Status", masterType: "statuses" }] }
    ]
  },
  customer: {
    table: 'customer_master',
    sections: [ // ➕ Add missing
      { title: "Basic Info", fields: [{ name: "customer_code", label: "Customer Code", type: "text", readonly: true }, { name: "name", label: "Name", type: "text", required: true }, { name: "print_name", label: "Print Name", type: "text" }] },
      { title: "Contact Info", fields: [{ name: "contact_person", label: "Contact Person", type: "text" }, { name: "phone_res", label: "Phone (Res)", type: "text" }, { name: "phone_off", label: "Phone (Off)", type: "text" }, { name: "mobile", label: "Mobile", type: "tel" }, { name: "email", label: "Email", type: "email" }, { name: "web", label: "Web", type: "text" }] }, // ➕ Added
      { title: "Address", fields: [{ name: "address", label: "Address", type: "textarea" }, { name: "area", label: "Area", masterType: "areas" }, { name: "transport", label: "Transport", masterType: "transport" }] }, // ➕ Transport
      { title: "Tax", fields: [{ name: "gst_no", label: "GST No", type: "text" }] }, // ➕ GST (gst_number in DB)
      { title: "Financial", fields: [{ name: "limit_days", label: "Limit Days", type: "number" }, { name: "limit_amount", label: "Limit Amount", type: "number" }, { name: "opening_balance", label: "Opening Balance", type: "number" }, { name: "balance_type", label: "Balance Type", type: "select", options: [{value:"Dr",label:"Dr"},{value:"Cr",label:"Cr"}] }] }, // ➕ Financial
      { title: "Other", fields: [{ name: "status", label: "Status", masterType: "statuses", type: "select" }] }
    ]
  },
  supplier: {
    table: "supplier_master",
    sections: [ // 🔄 Minor rename, ✅ mostly good
      { title: "Basic Info", fields: [{ name: "supplier_code", label: "Supplier Code", type: "text", readonly: true }, { name: "name", label: "Supplier Name", type: "text", required: true }, { name: "print_name", label: "Print Name", type: "text" }, { name: "contact_person", label: "Contact Person", type: "text" }] },
      { title: "Address Details", fields: [{ name: "address", label: "Address", type: "textarea", rows: 3 }, { name: "area", label: "Area", masterType: "areas" }] },
      { title: "Contact Info", fields: [{ name: "phone_res", label: "Phone (Res)", type: "text" }, { name: "phone_off", label: "Phone (Off)", type: "text" }, { name: "mobile", label: "Mobile", type: "text" }, { name: "email", label: "Email", type: "email" }, { name: "web", label: "Web", type: "text" }, { name: "gst_no", label: "GST No", type: "text" }] }, // 🔄 gst_tin_no → gst_no (gst_number DB)
      { title: "Credit Limit & Financial", fields: [{ name: "transport", label: "Transport", masterType: "transport" }, { name: "limit_days", label: "Limit Days", type: "number" }, { name: "limit_amount", label: "Limit Amount", type: "number" }, { name: "opening_balance", label: "Opening Balance", type: "number" }, { name: "balance_type", label: "Balance Type", type: "select", options: [{value:"Dr",label:"Dr"},{value:"Cr",label:"Cr"}] }] }, // ➕ balance_type
      { title: "Other", fields: [{ name: "status", label: "Status", masterType: "statuses" }] }
    ]
  },
  flour_mill: {
    table: 'flour_mill_master',
    sections: [ // ➕ Full expansion per schema/DB
      { title: "Basic Info", fields: [{ name: "mill_name", label: "Mill Name", type: "text", required: true }] }, // flourmill in DB
      { title: "Contact Info", fields: [{ name: "contact_person", label: "Contact Person", type: "text" }, { name: "phone", label: "Phone", type: "text" }] },
      { title: "Address", fields: [{ name: "address", label: "Address", type: "textarea" }] },
      { title: "Tax", fields: [{ name: "gst_no", label: "GST No", type: "text" }] },
      { title: "Financial", fields: [{ name: "wages_kg", label: "Wages/kg", type: "number" }, { name: "opening_balance", label: "Opening Balance", type: "number" }] },
      { title: "Other", fields: [{ name: "status", label: "Status", masterType: "statuses" }] }
    ]
  },
  papad_company: { // ➕ Full per schema (papad_company_master)
    table: 'papad_company_master',
    sections: [
      { title: "Basic Info", fields: [{ name: "company_name", label: "Company Name", type: "text", required: true }] },
      { title: "Contact Info", fields: [{ name: "contact_person", label: "Contact Person", type: "text" }, { name: "phone", label: "Phone", type: "text" }] },
      { title: "Address", fields: [{ name: "address", label: "Address", type: "textarea" }] },
      { title: "Tax", fields: [{ name: "gst_no", label: "GST No", type: "text" }] },
      { title: "Other", fields: [{ name: "status", label: "Status", masterType: "statuses" }] }
    ]
  },
  weight: {
    table: "weightmaster",
    sections: [ // ➕
      { title: "Basic Info", fields: [{ name: "weight_name", label: "Weight Name", type: "text", required: true }, { name: "value", label: "Value", type: "number" }] },
      { title: "Other", fields: [{ name: "status", label: "Status", masterType: "statuses" }] }
    ]
  },
  ledger_group: {
    table: "ledgergroupmaster",
    sections: [ // ➕
      { title: "Basic Info", fields: [{ name: "group_name", label: "Group Name", type: "text", required: true }, { name: "parent_group", label: "Parent Group", masterType: "ledger_groups" }] },
      { title: "Other", fields: [{ name: "nature", label: "Nature", type: "select", options: [{value:"Asset",label:"Asset"},{value:"Liability",label:"Liability"}] }, { name: "status", label: "Status", masterType: "statuses" }] }
    ]
  },
  ledger: {
    table: "ledgermaster",
    sections: [ // ➕
      { title: "Basic Info", fields: [{ name: "ledger_name", label: "Ledger Name", type: "text", required: true }, { name: "ledger_group", label: "Ledger Group", masterType: "ledger_groups" }] },
      { title: "Financial", fields: [{ name: "opening_balance", label: "Opening Balance", type: "number" }, { name: "balance_type", label: "Balance Type", type: "select", options: [{value:"Dr",label:"Dr"},{value:"Cr",label:"Cr"}] }] },
      { title: "Other", fields: [{ name: "status", label: "Status", masterType: "statuses" }] }
    ]
  },
  area: {
    table: "area_master",
    sections: [ // ➕ city
      { title: "Basic Info", fields: [{ name: "area_name", label: "Area Name", type: "text", required: true }] },
      { title: "Other", fields: [{ name: "city", label: "City", masterType: "cities" }, { name: "status", label: "Status", masterType: "statuses" }] }
    ]
  },
  city: {
    table: "city_master",
    sections: [ // ➕ state
      { title: "Basic Info", fields: [{ name: "city_name", label: "City Name", type: "text", required: true }] },
      { title: "Other", fields: [{ name: "state", label: "State", type: "text" }, { name: "status", label: "Status", masterType: "statuses" }] }
    ]
  },
  consignee: {
    table: "consignee_group_master",
    sections: [ // ➕
      { title: "Basic Info", fields: [{ name: "consignee_name", label: "Consignee Name", type: "text", required: true }] },
      { title: "Address", fields: [{ name: "address", label: "Address", type: "textarea" }] },
      { title: "Other", fields: [{ name: "phone", label: "Phone", type: "number" }, { name: "status", label: "Status", masterType: "statuses" }] }
    ]
  },
  transport: {
    table: "transport_master",
    sections: [ // ➕
      { title: "Basic Info", fields: [{ name: "transport_name", label: "Transport Name", type: "text", required: true }, { name: "contact_person", label: "Contact Person", type: "text" }] },
      { title: "Other", fields: [{ name: "phone", label: "Phone", type: "number" }, { name: "status", label: "Status", masterType: "statuses" }] }
    ]
  },
  p_trans: {
    table: "ptrans_master",
    sections: [ // ➕ status
      { title: "Basic Info", fields: [{ name: "transport_name", label: "Transport Name", type: "text", required: true }] },
      { title: "Other", fields: [{ name: "status", label: "Status", masterType: "statuses" }] }
    ]
  },
  sender: {
    table: "sender_group_master",
    sections: [ // ➕
      { title: "Basic Info", fields: [{ name: "sender_name", label: "Sender Name", type: "text", required: true }] },
      { title: "Address", fields: [{ name: "address", label: "Address", type: "textarea" }] },
      { title: "Other", fields: [{ name: "phone", label: "Phone", type: "number" }, { name: "status", label: "Status", masterType: "statuses" }] }
    ]
  },
  godown: {
    table: "godown_master",
    sections: [
      { title: "Basic Info", fields: [{ name: "godown_name", label: "Name", type: "text", required: true }, { name: "print_name", label: "Print Name", type: "text" }] },
      { title: "Contact Info", fields: [{ name: "contact_person", label: "Contact Person", type: "text" }, { name: "phone_off", label: "Phone (Off)", type: "text" }, { name: "mobile", label: "Mobile", type: "text" }, { name: "email", label: "Email", type: "email" }, { name: "web", label: "Web", type: "text" }] },
      { title: "Address", fields: [{ name: "address", label: "Address", type: "textarea" }, { name: "area", label: "Area", masterType: "areas" }] },
      { title: "Tax", fields: [{ name: "gst_no", label: "GST No", type: "text" }] },
      { title: "Other", fields: [{ name: "location", label: "Location", type: "text" }, { name: "status", label: "Status", masterType: "statuses" }] }
    ]
  },
  deduction_sales: {
    table: "deduction_sales",
    sections: [ // ➕ type, status; value=ded_value
      { title: "Basic Info", fields: [{ name: "deduction_name", label: "Deduction Name", type: "text", required: true }, { name: "type", label: "Type", type: "select", options: [{value:"%",label:"%"},{value:"Amount",label:"Amount"}] }, { name: "value", label: "Value", type: "number" }] },
      { title: "Other", fields: [{ name: "status", label: "Status", masterType: "statuses" }] }
    ]
  },
  deduction_purchase: {
    table: "deduction_purchase",
    sections: [ // Similar
      { title: "Basic Info", fields: [{ name: "deduction_name", label: "Deduction Name", type: "text", required: true }, { name: "type", label: "Type", type: "select", options: [{value:"%",label:"%"},{value:"Amount",label:"Amount"}] }, { name: "value", label: "Value", type: "number" }] },
      { title: "Other", fields: [{ name: "status", label: "Status", masterType: "statuses" }] }
    ]
  }
};

// Hook for easy config access
export const useMasterConfig = (moduleName) => {
  return MASTER_CONFIG[moduleName] || null;
};
