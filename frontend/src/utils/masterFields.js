// Dropdown mappings (API tables)
export const MASTER_FIELD_TYPES = {
  item_group: "item_groups",
  ledger_group: "ledgergroupmaster",
  ledger: "ledgermaster",
  area: "area_master",
  city: "city_master",
  transport: "transport_master",
  p_trans: "ptrans_master",
  sender: "sender_group_master",
  consignee: "consignee_group_master",
  godown: "godown_master",
  flour_mill: "flour_mill_master",
  papad_company: "papad_company_master",
  weight: "weightmaster",
  statuses: ["Active", "Inactive"], // Static
  deduction_type: ["%", "Amount"], // Static
  nature: ["Assets", "Liabilities", "Income", "Expense"] // Ledger Group
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


// Status dropdown for ALL modules
// Status field for ALL modules
const STATUS_FIELD = { 
  name: "status", 
  label: "Status", 
  type: "select", 
  options: ["Active", "Inactive"], 
  defaultValue: "Active" 
};


export const MASTER_CONFIG = {
  item_group: {
    table: 'item_groups',
    sections: [
      { title: "Basic Info", fields: [
        { name: "group_code", label: "Item Group", type: "text", readonly: true },
        { name: "group_name", label: "Group Name", type: "text", required: true },
        { name: "print_name", label: "(Print Name)", type: "text" },
        { name: "tax", label: "Tax %", type: "number" }
      ] },
      { title: "Status", fields: [STATUS_FIELD] }
    ]
  },
  item: {
    table: 'item_master',
    sections: [
      { title: "Basic Info", fields: [
        { name: "item_code", label: "Item Code", type: "text", readonly: true },
        { name: "item_name", label: "Item Name", type: "text", required: true },
        { name: "print_name", label: "(Print Name)", type: "text" }
      ] },
      { title: "Classification", fields: [
        { name: "item_group", label: "Item Group", masterType: "item" },
        { name: "type", label: "Type", type: "text" }
      ] },
      { title: "Tax Details", fields: [
        { name: "tax", label: "Tax %", type: "number" },
        { name: "hsn_code", label: "HSN", type: "text" },
        { name: "ed_percent", label: "ED %", type: "number" }
      ] },
      { title: "Status", fields: [STATUS_FIELD] }
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
    sections: [
      { title: "Basic Info", fields: [
        { name: "flourmill", label: "Flour Mill", type: "text", required: true },
        { name: "print_name", label: "(Print Name)", type: "text" },
        { name: "contact_person", label: "Cont. Person", type: "text" },
        { name: "area", label: "Area", masterType: "area_master" }
      ] },
      { title: "Address", fields: [
        { name: "address1", label: "Address", type: "textarea", rows: 3 }
      ] },
      { title: "Contact", fields: [
        { name: "phone_res", label: "Phone (Res)", type: "text" },
        { name: "phone_off", label: "Phone (Off)", type: "text" },
        { name: "mobile1", label: "Mobile 1", type: "text" },
        { name: "mobile2", label: "Mobile 2", type: "text" }
      ] },
      { title: "Tax", fields: [
        { name: "gst_number", label: "GST No", type: "text" }
      ] },
      { title: "Financial", fields: [
        { name: "wages_kg", label: "Wages/Kg", type: "number" },
        { name: "opening_balance", label: "Opening Balance", type: "number" }
      ] },
      { title: "Status", fields: [STATUS_FIELD] }
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
    title: "Ledger",
    table: "ledgermaster",
    sections: [
      {
        title: "Ledger Details",
        fields: [
          { name: "name", label: "Name", type: "text", required: true },
          { name: "printname", label: "Print Name", type: "text" },
          { 
            name: "under", 
            label: "Under (Group)", 
            type: "select", 
            masterType: "ledger_groups" 
          },
          { 
            name: "openingbalance", 
            label: "Opening Balance", 
            type: "number", 
            default: 0 
          },
          { name: "area", label: "Area", masterType: "area_master" },
          { name: "credit", label: "Credit Limit", type: "number" },
          { name: "debit", label: "Debit Limit", type: "number" }
        ]
      }
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
