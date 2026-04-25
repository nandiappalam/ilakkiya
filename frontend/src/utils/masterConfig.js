export const MASTER_CONFIG = {
  ledger: {
    table: 'ledgermaster',
    sections: [
      {
        title: 'Basic Information',
        fields: [
          { name: 'name', label: 'Ledger Name', type: 'text', required: true },
          { name: 'printname', label: 'Print Name', type: 'text' },
          { name: 'under', label: 'Under', type: 'masterSelect', masterType: 'ledger_groups' },
        ]
      },
      {
        title: 'Financial Details',
        fields: [
          { name: 'openingbalance', label: 'Opening Balance', type: 'number' },
          { name: 'area', label: 'Area', type: 'masterSelect', masterType: 'area' },
        ]
      },
      {
        title: 'Status',
        fields: [
          { name: 'status', label: 'Status', type: 'select', options: [{ label: 'Active', value: 'Active' }, { label: 'Inactive', value: 'Inactive' }], defaultValue: 'Active' }
        ]
      }
    ]
  },
  ledger_group: {
    table: 'ledgergroupmaster',
    sections: [
      {
        title: 'Basic Information',
        fields: [
          { name: 'name', label: 'Group Name', type: 'text', required: true },
          { name: 'printname', label: 'Print Name', type: 'text' },
        ]
      },
      {
        title: 'Status',
        fields: [
          { name: 'status', label: 'Status', type: 'select', options: [{ label: 'Active', value: 'Active' }, { label: 'Inactive', value: 'Inactive' }], defaultValue: 'Active' }
        ]
      }
    ]
  },
  area: {
    table: 'area_master',
    sections: [
      {
        title: 'Basic Information',
        fields: [
          { name: 'name', label: 'Area Name', type: 'text', required: true },
          { name: 'print_name', label: 'Print Name', type: 'text' },
        ]
      },
      {
        title: 'Status',
        fields: [
          { name: 'status', label: 'Status', type: 'select', options: [{ label: 'Active', value: 'Active' }, { label: 'Inactive', value: 'Inactive' }], defaultValue: 'Active' }
        ]
      }
    ]
  },
  city: {
    table: 'city_master',
    sections: [
      {
        title: 'Basic Information',
        fields: [
          { name: 'name', label: 'City Name', type: 'text', required: true },
          { name: 'print_name', label: 'Print Name', type: 'text' },
        ]
      },
      {
        title: 'Status',
        fields: [
          { name: 'status', label: 'Status', type: 'select', options: [{ label: 'Active', value: 'Active' }, { label: 'Inactive', value: 'Inactive' }], defaultValue: 'Active' }
        ]
      }
    ]
  },
  transport: {
    table: 'transport_master',
    sections: [
      {
        title: 'Basic Information',
        fields: [
          { name: 'name', label: 'Transport Name', type: 'text', required: true },
          { name: 'print_name', label: 'Print Name', type: 'text' },
        ]
      },
      {
        title: 'Status',
        fields: [
          { name: 'status', label: 'Status', type: 'select', options: [{ label: 'Active', value: 'Active' }, { label: 'Inactive', value: 'Inactive' }], defaultValue: 'Active' }
        ]
      }
    ]
  },
  p_trans: {
    table: 'ptrans_master',
    sections: [
      {
        title: 'Basic Information',
        fields: [
          { name: 'name', label: 'P.Trans Name', type: 'text', required: true },
          { name: 'print_name', label: 'Print Name', type: 'text' },
        ]
      },
      {
        title: 'Status',
        fields: [
          { name: 'status', label: 'Status', type: 'select', options: [{ label: 'Active', value: 'Active' }, { label: 'Inactive', value: 'Inactive' }], defaultValue: 'Active' }
        ]
      }
    ]
  },
  sender: {
    table: 'sender_group_master',
    sections: [
      {
        title: 'Basic Information',
        fields: [
          { name: 'name', label: 'Sender Name', type: 'text', required: true },
          { name: 'print_name', label: 'Print Name', type: 'text' },
        ]
      },
      {
        title: 'Contact Information',
        fields: [
          { name: 'contact_person', label: 'Contact Person', type: 'text' },
          { name: 'phone_res', label: 'Phone (Res)', type: 'text' },
          { name: 'phone_off', label: 'Phone (Off)', type: 'text' },
          { name: 'mobile', label: 'Mobile', type: 'text' },
        ]
      },
      {
        title: 'Address',
        fields: [
          { name: 'address', label: 'Address', type: 'textarea' },
          { name: 'area', label: 'Area', type: 'masterSelect', masterType: 'area' },
        ]
      },
      {
        title: 'Tax',
        fields: [
          { name: 'tin_no', label: 'TIN No', type: 'text' },
        ]
      },
      {
        title: 'Status',
        fields: [
          { name: 'status', label: 'Status', type: 'select', options: [{ label: 'Active', value: 'Active' }, { label: 'Inactive', value: 'Inactive' }], defaultValue: 'Active' }
        ]
      }
    ]
  },
  consignee: {
    table: 'consignee_group_master',
    sections: [
      {
        title: 'Basic Information',
        fields: [
          { name: 'name', label: 'Consignee Name', type: 'text', required: true },
          { name: 'print_name', label: 'Print Name', type: 'text' },
        ]
      },
      {
        title: 'Contact Information',
        fields: [
          { name: 'contact_person', label: 'Contact Person', type: 'text' },
          { name: 'phone_res', label: 'Phone (Res)', type: 'text' },
          { name: 'phone_off', label: 'Phone (Off)', type: 'text' },
          { name: 'mobile', label: 'Mobile', type: 'text' },
        ]
      },
      {
        title: 'Address',
        fields: [
          { name: 'address', label: 'Address', type: 'textarea' },
          { name: 'area', label: 'Area', type: 'masterSelect', masterType: 'area' },
        ]
      },
      {
        title: 'Tax',
        fields: [
          { name: 'tin_no', label: 'TIN No', type: 'text' },
        ]
      },
      {
        title: 'Status',
        fields: [
          { name: 'status', label: 'Status', type: 'select', options: [{ label: 'Active', value: 'Active' }, { label: 'Inactive', value: 'Inactive' }], defaultValue: 'Active' }
        ]
      }
    ]
  },
  godown: {
    table: 'godown_master',
    sections: [
      {
        title: 'Basic Information',
        fields: [
          { name: 'godown_name', label: 'Godown Name', type: 'text', required: true },
          { name: 'print_name', label: 'Print Name', type: 'text' },
        ]
      },
      {
        title: 'Status',
        fields: [
          { name: 'status', label: 'Status', type: 'select', options: [{ label: 'Active', value: 'Active' }, { label: 'Inactive', value: 'Inactive' }], defaultValue: 'Active' }
        ]
      }
    ]
  },
  customer: {
    table: 'customer_master',
    sections: [
      {
        title: 'Basic Information',
        fields: [
          { name: 'name', label: 'Name', type: 'text', required: true },
          { name: 'print_name', label: 'Print Name', type: 'text' },
          { name: 'contact_person', label: 'Contact Person', type: 'text' },
        ]
      },
      {
        title: 'Address',
        fields: [
          { name: 'address1', label: 'Address Line 1', type: 'text' },
          { name: 'address2', label: 'Address Line 2', type: 'text' },
          { name: 'address3', label: 'Address Line 3', type: 'text' },
          { name: 'address4', label: 'Address Line 4', type: 'text' },
          { name: 'area', label: 'Area', type: 'masterSelect', masterType: 'area' },
        ]
      },
      {
        title: 'Contact',
        fields: [
          { name: 'phone_off', label: 'Phone (Off)', type: 'text' },
          { name: 'phone_res', label: 'Phone (Res)', type: 'text' },
          { name: 'mobile1', label: 'Mobile 1', type: 'text' },
          { name: 'mobile2', label: 'Mobile 2', type: 'text' },
        ]
      },
      {
        title: 'Tax & Financial',
        fields: [
          { name: 'gst_number', label: 'GST Number', type: 'text' },
          { name: 'opening_balance', label: 'Opening Balance', type: 'number' },
        ]
      },
      {
        title: 'Status',
        fields: [
          { name: 'status', label: 'Status', type: 'select', options: [{ label: 'Active', value: 'Active' }, { label: 'Inactive', value: 'Inactive' }], defaultValue: 'Active' }
        ]
      }
    ]
  },
  supplier: {
    table: 'supplier_master',
    sections: [
      {
        title: 'Basic Information',
        fields: [
          { name: 'name', label: 'Name', type: 'text', required: true },
          { name: 'print_name', label: 'Print Name', type: 'text' },
          { name: 'contact_person', label: 'Contact Person', type: 'text' },
        ]
      },
      {
        title: 'Address',
        fields: [
          { name: 'address1', label: 'Address Line 1', type: 'text' },
          { name: 'address2', label: 'Address Line 2', type: 'text' },
          { name: 'address3', label: 'Address Line 3', type: 'text' },
          { name: 'address4', label: 'Address Line 4', type: 'text' },
          { name: 'area', label: 'Area', type: 'masterSelect', masterType: 'area' },
        ]
      },
      {
        title: 'Contact',
        fields: [
          { name: 'phone_off', label: 'Phone (Off)', type: 'text' },
          { name: 'phone_res', label: 'Phone (Res)', type: 'text' },
          { name: 'mobile1', label: 'Mobile 1', type: 'text' },
          { name: 'mobile2', label: 'Mobile 2', type: 'text' },
        ]
      },
      {
        title: 'Tax & Financial',
        fields: [
          { name: 'gst_number', label: 'GST Number', type: 'text' },
          { name: 'opening_balance', label: 'Opening Balance', type: 'number' },
        ]
      },
      {
        title: 'Status',
        fields: [
          { name: 'status', label: 'Status', type: 'select', options: [{ label: 'Active', value: 'Active' }, { label: 'Inactive', value: 'Inactive' }], defaultValue: 'Active' }
        ]
      }
    ]
  },
  flour_mill: {
    table: 'flour_mill_master',
    sections: [
      {
        title: 'Basic Information',
        fields: [
          { name: 'flourmill', label: 'Flour Mill Name', type: 'text', required: true },
          { name: 'print_name', label: 'Print Name', type: 'text' },
          { name: 'contact_person', label: 'Contact Person', type: 'text' },
        ]
      },
      {
        title: 'Address',
        fields: [
          { name: 'address1', label: 'Address Line 1', type: 'text' },
          { name: 'address2', label: 'Address Line 2', type: 'text' },
          { name: 'address3', label: 'Address Line 3', type: 'text' },
          { name: 'address4', label: 'Address Line 4', type: 'text' },
          { name: 'area', label: 'Area', type: 'masterSelect', masterType: 'area' },
        ]
      },
      {
        title: 'Contact',
        fields: [
          { name: 'phone_off', label: 'Phone (Off)', type: 'text' },
          { name: 'phone_res', label: 'Phone (Res)', type: 'text' },
          { name: 'mobile1', label: 'Mobile 1', type: 'text' },
          { name: 'mobile2', label: 'Mobile 2', type: 'text' },
        ]
      },
      {
        title: 'Tax & Financial',
        fields: [
          { name: 'gst_number', label: 'GST Number', type: 'text' },
          { name: 'wages_kg', label: 'Wages per Kg', type: 'number' },
          { name: 'opening_balance', label: 'Opening Balance', type: 'number' },
        ]
      },
      {
        title: 'Status',
        fields: [
          { name: 'status', label: 'Status', type: 'select', options: [{ label: 'Active', value: 'Active' }, { label: 'Inactive', value: 'Inactive' }], defaultValue: 'Active' }
        ]
      }
    ]
  },
  papad_company: {
    table: 'papad_company_master',
    sections: [
      {
        title: 'Basic Information',
        fields: [
          { name: 'name', label: 'Company Name', type: 'text', required: true },
          { name: 'print_name', label: 'Print Name', type: 'text' },
          { name: 'contact_person', label: 'Contact Person', type: 'text' },
        ]
      },
      {
        title: 'Address',
        fields: [
          { name: 'address1', label: 'Address Line 1', type: 'text' },
          { name: 'address2', label: 'Address Line 2', type: 'text' },
          { name: 'address3', label: 'Address Line 3', type: 'text' },
          { name: 'address4', label: 'Address Line 4', type: 'text' },
          { name: 'area', label: 'Area', type: 'masterSelect', masterType: 'area' },
        ]
      },
      {
        title: 'Contact',
        fields: [
          { name: 'phone_off', label: 'Phone (Off)', type: 'text' },
          { name: 'phone_res', label: 'Phone (Res)', type: 'text' },
          { name: 'mobile1', label: 'Mobile 1', type: 'text' },
          { name: 'mobile2', label: 'Mobile 2', type: 'text' },
        ]
      },
      {
        title: 'Tax & Financial',
        fields: [
          { name: 'gst_no', label: 'GST Number', type: 'text' },
          { name: 'wages_kg', label: 'Wages per Kg', type: 'number' },
          { name: 'opening_balance', label: 'Opening Balance', type: 'number' },
          { name: 'opening_advance', label: 'Opening Advance', type: 'number' },
        ]
      },
      {
        title: 'Status',
        fields: [
          { name: 'status', label: 'Status', type: 'select', options: [{ label: 'Active', value: 'Active' }, { label: 'Inactive', value: 'Inactive' }], defaultValue: 'Active' }
        ]
      }
    ]
  },
  weight: {
    table: 'weightmaster',
    sections: [
      {
        title: 'Basic Information',
        fields: [
          { name: 'name', label: 'Weight Name', type: 'text', required: true },
          { name: 'printname', label: 'Print Name', type: 'text' },
        ]
      },
      {
        title: 'Details',
        fields: [
          { name: 'weight', label: 'Weight Value', type: 'number' },
        ]
      }
    ]
  },
  item_group: {
    table: 'item_groups',
    sections: [
      {
        title: 'Basic Information',
        fields: [
          { name: 'group_code', label: 'Group Code', type: 'text', readonly: true },
          { name: 'group_name', label: 'Group Name', type: 'text', required: true },
          { name: 'print_name', label: 'Print Name', type: 'text' },
        ]
      },
      {
        title: 'Tax',
        fields: [
          { name: 'tax', label: 'Tax %', type: 'number' },
        ]
      }
    ]
  },
  item: {
    table: 'item_master',
    sections: [
      {
        title: 'Basic Information',
        fields: [
          { name: 'item_code', label: 'Item Code', type: 'text', readonly: true },
          { name: 'item_name', label: 'Item Name', type: 'text', required: true },
          { name: 'print_name', label: 'Print Name', type: 'text' },
        ]
      },
      {
        title: 'Classification',
        fields: [
          { name: 'item_group', label: 'Item Group', type: 'masterSelect', masterType: 'item_groups' },
        ]
      },
      {
        title: 'Tax Details',
        fields: [
          { name: 'tax', label: 'Tax %', type: 'number' },
          { name: 'hsn_code', label: 'HSN Code', type: 'text' },
        ]
      },
      {
        title: 'Status',
        fields: [
          { name: 'status', label: 'Status', type: 'select', options: [{ label: 'Active', value: 'Active' }, { label: 'Inactive', value: 'Inactive' }], defaultValue: 'Active' }
        ]
      }
    ]
  },
  deduction_sales: {
    table: 'deduction_sales',
    sections: [
      {
        title: 'Basic Information',
        fields: [
          { name: 'ded_code', label: 'Deduction Code', type: 'text', required: true },
          { name: 'ded_name', label: 'Deduction Name', type: 'text', required: true },
          { name: 'print_name', label: 'Print Name', type: 'text' },
        ]
      },
      {
        title: 'Account Settings',
        fields: [
          { name: 'adjust_with_sales', label: 'Adjust With Sales', type: 'text' },
          { name: 'account_head', label: 'Account Head', type: 'text' },
          { name: 'ded_type', label: 'Deduction Type', type: 'text' },
        ]
      },
      {
        title: 'Calculation',
        fields: [
          { name: 'calc_type', label: 'Calculation Type', type: 'text' },
          { name: 'ded_value', label: 'Deduction Value', type: 'number' },
          { name: 'status', label: 'Status', type: 'select', options: [{ label: 'Active', value: 'Active' }, { label: 'Inactive', value: 'Inactive' }], defaultValue: 'Active' },
        ]
      }
    ]
  },
  deduction_purchase: {
    table: 'deduction_purchase',
    sections: [
      {
        title: 'Basic Information',
        fields: [
          { name: 'ded_code', label: 'Deduction Code', type: 'text', required: true },
          { name: 'ded_name', label: 'Deduction Name', type: 'text', required: true },
          { name: 'print_name', label: 'Print Name', type: 'text' },
        ]
      },
      {
        title: 'Account Settings',
        fields: [
          { name: 'debit_adjust', label: 'Debit Adjust', type: 'text' },
          { name: 'account_head', label: 'Account Head', type: 'text' },
          { name: 'credit_adjust', label: 'Credit Adjust', type: 'text' },
        ]
      },
      {
        title: 'Calculation',
        fields: [
          { name: 'ded_type', label: 'Deduction Type', type: 'text' },
          { name: 'calc_type', label: 'Calculation Type', type: 'text' },
          { name: 'status', label: 'Status', type: 'select', options: [{ label: 'Active', value: 'Active' }, { label: 'Inactive', value: 'Inactive' }], defaultValue: 'Active' },
        ]
      }
    ]
  }
};

