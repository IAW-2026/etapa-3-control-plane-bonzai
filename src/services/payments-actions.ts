"use server";

const API_BASE = process.env.PAYMENTS_API_URL || "";
const API_KEY = process.env.PAYMENTS_API_KEY || "";

async function paymentsRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(API_KEY ? { "x-api-key": API_KEY } : {}),
    ...(options?.headers as Record<string, string> || {}),
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || body?.message || `Error ${res.status}`);
  }

  return res.json();
}

// ── Health & Audit ──

export async function fetchPaymentsHealth() {
  return paymentsRequest<any>("/api/control-plane/health/dependencies");
}

export async function fetchAuditIntegrity() {
  return paymentsRequest<any>("/api/control-plane/audit/integrity");
}

// ── Transactions ──

export async function fetchTransactions(
  page = 1,
  limit = 10,
  status = "",
  search = "",
  buyerId = "",
  sellerId = "",
  from = "",
  to = ""
) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) params.set("status", status);
  if (search) params.set("search", search);
  if (buyerId) params.set("buyerId", buyerId);
  if (sellerId) params.set("sellerId", sellerId);
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  return paymentsRequest<any>(`/api/control-plane/transactions?${params.toString()}`);
}

export async function fetchTransactionDetail(id: string) {
  return paymentsRequest<any>(`/api/control-plane/transactions/${id}`);
}

export async function forceTransactionStatus(id: string, status: string, reason: string) {
  return paymentsRequest<any>(`/api/control-plane/transactions/${id}/force-status`, {
    method: "PATCH",
    body: JSON.stringify({ status, reason }),
  });
}

export async function releaseFunds(id: string) {
  return paymentsRequest<any>(`/api/control-plane/transactions/${id}/release-funds`, {
    method: "POST",
  });
}

// ── Disputes ──

export async function fetchDisputes(
  page = 1,
  limit = 10,
  status = "",
  reason = "",
  from = "",
  to = ""
) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) params.set("status", status);
  if (reason) params.set("reason", reason);
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  return paymentsRequest<any>(`/api/control-plane/disputes?${params.toString()}`);
}

// ── Wallets ──

export async function fetchWallets(page = 1, limit = 10, search = "") {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) params.set("search", search);
  return paymentsRequest<any>(`/api/control-plane/wallets?${params.toString()}`);
}

export async function fetchWalletDetail(userId: string) {
  return paymentsRequest<any>(`/api/control-plane/wallets/${userId}`);
}

export async function adjustWalletBalance(
  userId: string,
  type: "CREDIT" | "DEBIT",
  amount: number,
  reason: string
) {
  return paymentsRequest<any>(`/api/control-plane/wallets/${userId}/adjust`, {
    method: "POST",
    body: JSON.stringify({ type, amount, reason }),
  });
}

// ── Checkout Sessions ──

export async function fetchCheckoutSessions(
  page = 1,
  limit = 10,
  status = "",
  buyerId = "",
  from = "",
  to = ""
) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) params.set("status", status);
  if (buyerId) params.set("buyerId", buyerId);
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  return paymentsRequest<any>(`/api/control-plane/checkout-sessions?${params.toString()}`);
}

export async function fetchCheckoutSessionDetail(id: string) {
  return paymentsRequest<any>(`/api/control-plane/checkout-sessions/${id}`);
}
