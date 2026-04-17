/**
 * Simplified API Wrapper for Tauri Backend
 * Provides a unified interface for all Tauri invoke calls
 * 
 * Uses Tauri v1 API (@tauri-apps/api)
 

import { invoke } from '@tauri-apps/api';

// Generic API wrapper
export async function api(command, payload = {}) {
  try {
    return await invoke(command, payload);
  } catch (error) {
    console.error(`API Error [${command}]:`, error);
    throw error;
  }
}

// Alias for backward compatibility - re-export from tauriApi
export * from '../utils/api';

export default api;
*/