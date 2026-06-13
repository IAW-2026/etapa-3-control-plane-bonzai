const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const SERVICE_KEY = process.env.NEXT_PUBLIC_SERVICE_KEY || "";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(SERVICE_KEY ? { "x-service-key": SERVICE_KEY } : {}),
    ...(options?.headers as Record<string, string> || {}),
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      throw new Error("UNAUTHORIZED");
    }
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || `Error ${res.status}`);
  }

  return res.json();
}

export const api = {
  getPurchases: (page = 1, limit = 10, from = "", to = "") =>
    request<any>(`/api/admin/purchases?page=${page}&limit=${limit}${from ? `&from=${from}` : ""}${to ? `&to=${to}` : ""}`),

  getOrders: (page = 1, limit = 10, status = "", search = "", from = "", to = "") =>
    request<any>(`/api/admin/orders?page=${page}&limit=${limit}${status ? `&status=${status}` : ""}${search ? `&search=${search}` : ""}${from ? `&from=${from}` : ""}${to ? `&to=${to}` : ""}`),

  getOrder: (id: string) => request<any>(`/api/admin/orders/${id}`),

  updateOrderStatus: (id: string, status: string, reason?: string) =>
    request<any>(`/api/admin/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, reason }),
    }),

  refundOrder: (id: string, reason?: string) =>
    request<any>(`/api/admin/orders/${id}/refund`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),

  getOrderTimeline: (id: string) =>
    request<any>(`/api/admin/orders/${id}/timeline`),

  getUsers: (page = 1, limit = 10, search = "") =>
    request<any>(`/api/admin/users?page=${page}&limit=${limit}${search ? `&search=${search}` : ""}`),

  getUser: (clerkId: string) => request<any>(`/api/admin/users/${clerkId}`),

  disableUser: (clerkId: string) =>
    request<any>(`/api/admin/users/${clerkId}/disable`, { method: "POST" }),

  enableUser: (clerkId: string) =>
    request<any>(`/api/admin/users/${clerkId}/enable`, { method: "POST" }),

  getProducts: (page = 1, limit = 10, search = "", includeInactive = false) =>
    request<any>(`/api/admin/products?page=${page}&limit=${limit}${search ? `&search=${search}` : ""}${includeInactive ? "&includeInactive=true" : ""}`),

  updateProduct: (id: string, data: { suspended?: boolean }) =>
    request<any>(`/api/admin/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  getReservations: (page = 1, limit = 10, status = "", from = "", to = "") =>
    request<any>(`/api/admin/reservations?page=${page}&limit=${limit}${status ? `&status=${status}` : ""}${from ? `&from=${from}` : ""}${to ? `&to=${to}` : ""}`),

  releaseReservation: (id: string) =>
    request<any>(`/api/admin/reservations/${id}/release`, { method: "POST" }),

  getReviews: (page = 1, limit = 10, rating = "") =>
    request<any>(`/api/admin/reviews?page=${page}&limit=${limit}${rating ? `&rating=${rating}` : ""}`),

  getHealth: () => request<any>("/api/admin/health/dependencies"),

  getAnalyticsOverview: () => request<any>("/api/admin/analytics"),

  getStatistics: () => request<any>("/api/admin/statistics"),
};
