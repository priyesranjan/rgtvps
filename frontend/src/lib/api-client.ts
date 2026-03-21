const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

async function handleResponse(res: Response, endpoint: string, method: string) {
  if (!res.ok) {
    let errorMessage = "Request failed";
    try {
      const error = await res.json();
      errorMessage = error.error || errorMessage;
    } catch (e) {
      errorMessage = res.statusText || errorMessage;
    }
    
    if (res.status === 401 && typeof window !== "undefined") {
      localStorage.clear();
      window.location.href = "/auth/login";
    }
    
    console.error(`[API ERROR] ${method} ${endpoint}:`, errorMessage);
    throw new Error(String(errorMessage));
  }
  return res.json();
}

export const apiClient = {
  get: async (endpoint: string, token?: string) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        "Authorization": token ? `Bearer ${token}` : "",
        "Content-Type": "application/json"
      }
    });
    return handleResponse(res, endpoint, "GET");
  },

  post: async (endpoint: string, body: any, token?: string) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: {
        "Authorization": token ? `Bearer ${token}` : "",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    return handleResponse(res, endpoint, "POST");
  },

  put: async (endpoint: string, body: any, token?: string) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "PUT",
      headers: {
        "Authorization": token ? `Bearer ${token}` : "",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    return handleResponse(res, endpoint, "PUT");
  },

  patch: async (endpoint: string, body: any, token?: string) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
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
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "DELETE",
      headers: {
        "Authorization": token ? `Bearer ${token}` : "",
        "Content-Type": "application/json"
      }
    });
    return handleResponse(res, endpoint, "DELETE");
  }
};
