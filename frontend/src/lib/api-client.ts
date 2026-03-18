const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export const apiClient = {
  get: async (endpoint: string, token?: string) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        "Authorization": token ? `Bearer ${token}` : "",
        "Content-Type": "application/json"
      }
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Request failed");
    }
    return res.json();
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
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Request failed");
    }
    return res.json();
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
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Request failed");
    }
    return res.json();
  }
};
