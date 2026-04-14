import { useState, useEffect, useCallback } from 'react';
import api, { safeArray } from '../utils/api.js';

/**
 * useMasterData - Custom hook for caching master data dropdowns
 * Prevents multiple fetches for same master type
 * Auto-refreshes on focus/interval for latest data
 */
export const useMasterData = (masterType) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMaster = useCallback(async () => {
    if (!masterType) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const table = api.MASTER_TABLES[masterType] || masterType;
      const result = await api.getMasters(table);
      const masters = safeArray(result);
      setData(masters);
    } catch (err) {
      console.error(`Failed to fetch ${masterType}:`, err);
      setError(err.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [masterType]);

  useEffect(() => {
    fetchMaster();
  }, [fetchMaster]);

  // Auto-refresh every 5min or on window focus
  useEffect(() => {
    let refreshInterval;
    const handleFocus = () => fetchMaster();

    if (masterType) {
      refreshInterval = setInterval(fetchMaster, 5 * 60 * 1000); // 5min
      window.addEventListener('focus', handleFocus);
    }

    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [masterType, fetchMaster]);

  const refresh = useCallback(() => fetchMaster(), [fetchMaster]);

  return {
    data,
    loading,
    error,
    refresh
  };
};

