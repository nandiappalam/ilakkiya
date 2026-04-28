// Environment-aware BASE_URL
// In dev (Vite) we use relative URLs so the Vite proxy handles routing
// In production we hit the deployed Render backend directly
const BASE_URL = import.meta.env.DEV ? "" : "https://bvc-inventory-ilakkiya.onrender.com";

console.log("🚀 BASE URL:", BASE_URL || "(relative — using Vite proxy)");

// ✅ BASE_URL must NOT include /api — it is added per-request below
export async function api(endpoint, options = {}) {
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
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    // ✅ Null-safe JSON parse
    if (!res.ok) {
      console.error("❌ API HTTP error:", res.status, res.statusText);
      const text = await res.text();
      console.error("❌ Response body:", text);
      return { success: false, data: null, message: `HTTP ${res.status}: ${res.statusText}` };
    }

    return await res.json();
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

