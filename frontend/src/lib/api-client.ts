const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api").replace(/\/$/, "");

async function handleResponse(res: Response, endpoint: string, method: string) {
  if (!res.ok) {
    let errorMessage = "Request failed";
    try {
      const error = await res.json();
      errorMessage = error.error || error.message || errorMessage;
    } catch {
      errorMessage = res.statusText || errorMessage;
    }
    
    if (res.status === 401 && typeof window !== "undefined") {
      localStorage.clear();
      window.location.href = "/auth/login";
    }
    
    console.error(`[API ERROR] ${method} ${endpoint}:`, errorMessage);
    throw new Error(String(errorMessage));
  }
  
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    console.error(`[API PARSE ERROR] ${method} ${endpoint}:`, text);
    throw new Error("Invalid server response (not JSON)");
  }
}

export const apiClient = {
  get: async (endpoint: string, token?: string) => {
    const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": token ? `Bearer ${token}` : "",
        "Content-Type": "application/json"
      }
    });
    return handleResponse(res, endpoint, "GET");
  },

  post: async (endpoint: string, body: unknown, token?: string) => {
    const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": token ? `Bearer ${token}` : "",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    return handleResponse(res, endpoint, "POST");
  },

  put: async (endpoint: string, body: unknown, token?: string) => {
    const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Authorization": token ? `Bearer ${token}` : "",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    return handleResponse(res, endpoint, "PUT");
  },

  patch: async (endpoint: string, body: unknown, token?: string) => {
    const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;
    const res = await fetch(url, {
      method: "PATCH",
      headers: {
        "Authorization": token ? `Bearer ${token}` : "",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    return handleResponse(res, endpoint, "PATCH");
  },

  delete: async (endpoint: string, token?: string) => {
    const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;
    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        "Authorization": token ? `Bearer ${token}` : "",
        "Content-Type": "application/json"
      }
    });
    return handleResponse(res, endpoint, "DELETE");
  }
};
