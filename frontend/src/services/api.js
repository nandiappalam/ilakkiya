const isTauri = typeof window !== "undefined" && window.__TAURI__;
const isDev = import.meta.env.DEV;

let BASE_URL;
if (isTauri) {
   BASE_URL = "http://localhost:5000";
} else if (isDev) {
  // Local development — frontend (vite dev server) talks to backend on port 5000
  const envUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  BASE_URL = envUrl.replace(/\/api\/?$/, "");
} else {
  // Production (Render) — backend serves frontend, use same-origin relative URLs
  BASE_URL = "";
}

// ✅ BASE_URL must NOT include /api — it is added per-request below
export async function api(endpoint, method = "GET", body = null) {
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
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : null,
    });

    // ✅ Null-safe JSON parse
    if (!res.ok) {
      console.error("❌ API HTTP error:", res.status, res.statusText);
      const text = await res.text();
      console.error("❌ Response body:", text);
      return { success: false, data: null, message: `HTTP ${res.status}: ${res.statusText}` };
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("🔥 API FAILED:", err);
    return { success: false, data: null, message: err.message };
  }
}

// helpers

export const getMasters = (type) => api(`/masters/${type}`);

export const getNextLot = () => api(`/masters/lots/next`);

// Export for backward compatibility
export default api;
