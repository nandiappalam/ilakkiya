// frontend/src/modules/vouchers/voucherService.js
// Voucher-specific API wrapper

import api from '../../services/api.js';

export const voucherAPI = {
  getAll: () => api('/vouchers'),
  create: (data) => api('vouchers', { method: 'POST', body: data }),
getLedgers: () => api('/masters/ledgermaster'),
getLedgerGroups: () => api('ledgergroupmaster')
};

export default voucherAPI;

