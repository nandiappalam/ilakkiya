import api from '../services/api.js'

export const safeArray = (data) => Array.isArray(data) ? data : [];

export const getMasters = async (type) => {
  const result = await api(`/masters/${type}`);
  if (!result) {
    console.error("❌ API failed");
    return [];
  }
  if (result.success) {
    return result.data || result || [];
  }
  return [];
};

export const createMaster = async (table, data) => {
  const result = await api(`/masters/${table}`, 'POST', data);
  if (!result) {
    console.error("❌ Create failed");
    return null;
  }
  if (result.success) {
    return result;
  }
  return null;
}

export const updateMaster = async (table, id, data) => {
  const result = await api(`/masters/${table}/${id}`, 'PUT', data);
  if (!result || !result.success) {
    console.error("❌ Update failed");
    return false;
  }
  return true;
}

export const deleteMaster = async (table, id) => {
  const result = await api(`/masters/${table}/${id}`, 'DELETE');
  if (!result || !result.success) {
    console.error("❌ Delete failed");
    return false;
  }
  return true;
}
