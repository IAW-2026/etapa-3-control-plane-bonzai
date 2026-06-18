"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const API_BASE = process.env.NEXT_PUBLIC_SHIPPING_API_URL || "";
const SERVICE_KEY = process.env.SHIPPING_SERVICE_KEY || "";

async function serverRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const { getToken } = await auth();
  const token = await getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-shipping-service-key": SERVICE_KEY,
    ...(options?.headers as Record<string, string> || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || `Error ${res.status}`);
  }

  return res.json();
}

export async function fetchDeliveryStats() {
  return serverRequest<any>("/api/analytics/delivery-stats");
}

export async function fetchShipments(page = 1, limit = 10, status = "", sellerId = "") {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) params.set("status", status);
  if (sellerId) params.set("seller_id", sellerId);
  return serverRequest<any>(`/api/admin/shipments?${params.toString()}`);
}

export async function fetchIncidents(page = 1, limit = 10) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  return serverRequest<any>(`/api/admin/shipments/incidents?${params.toString()}`);
}

export async function fetchDrivers(page = 1, limit = 10) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  return serverRequest<any>(`/api/admin/drivers?${params.toString()}`);
}

export async function fetchDriverShipments(id: string, page = 1, limit = 20) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  return serverRequest<any>(`/api/admin/drivers/${id}/shipments?${params.toString()}`);
}

export async function fetchOperators(page = 1, limit = 10) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  return serverRequest<any>(`/api/admin/operators?${params.toString()}`);
}

export async function fetchOperatorShipments(id: string, page = 1, limit = 20) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  return serverRequest<any>(`/api/admin/operators/${id}/shipments?${params.toString()}`);
}

export async function updateShipmentStatus(id: string, status: string) {
  const result = await serverRequest<any>(`/api/admin/shipments/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

  revalidatePath("/dashboard/shipping/shipments");
  revalidatePath(`/dashboard/shipping/shipments/${id}`);
  revalidatePath("/dashboard/shipping/incidents");

  return result;
}

export async function updateDriverStatus(id: string, status: string) {
  const driverStatus = status === "ACTIVE" ? "AVAILABLE" : status;

  const result = await serverRequest<any>(`/api/admin/drivers/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: driverStatus }),
  });

  revalidatePath("/dashboard/shipping/staff/drivers");
  revalidatePath(`/dashboard/shipping/staff/drivers/${id}`);

  return result;
}

export async function updateOperatorStatus(id: string, status: string) {
  const result = await serverRequest<any>(`/api/admin/operators/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

  revalidatePath("/dashboard/shipping/staff/operators");
  revalidatePath(`/dashboard/shipping/staff/operators/${id}`);

  return result;
}
