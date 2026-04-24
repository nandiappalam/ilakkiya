const isTauri = typeof window !== "undefined" && window.__TAURI__;

const BASE_URL = isTauri
  ? "http://localhost:5000"
  : import.meta.env.VITE_API_URL || "http://localhost:5000";

const API_BASE = BASE_URL;

export async function api(endpoint, method = "GET", body = null) {
  if (!endpoint || typeof endpoint !== "string") {
    console.error("❌ Invalid endpoint:", endpoint);
    return null;
  }

  // ✅ ALWAYS ensure leading slash
  if (!endpoint.startsWith("/")) {
    endpoint = "/" + endpoint;
  }

  const url = `${BASE_URL}/api` + endpoint;
  console.log("🌐 FINAL URL:", url);

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : null,
    });

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("🔥 API FAILED:", err);
    return null;
  }
}

// helpers

export const getMasters = (type) => api(`/masters/${type}`);

export const getNextLot = () => api(`/masters/lots/next`);

// Export for backward compatibility
export default api;
