const BUYER_API_BASE = "/api/buyer";

export interface BuyerIdentity {
  id: string;
  clerkUserId: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Buyer extends BuyerIdentity {
  isProfileComplete?: boolean;
  addressCount?: number;
  hasCart?: boolean;
  cartItemCount?: number;
  cartQuantity?: number;
  addresses?: ShippingAddress[];
  cart?: Cart | null;
}

export interface ShippingAddress {
  id: string;
  buyerId: string;
  label: string | null;
  address: string;
  apartment: string | null;
  floor: string | null;
  city: string;
  postalCode: string;
  province: string;
  country: string;
  createdAt: string;
  updatedAt: string;
  buyer?: BuyerIdentity;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface Cart {
  id: string;
  buyerId: string;
  buyer?: BuyerIdentity;
  itemCount: number;
  totalQuantity: number;
  isEmpty: boolean;
  createdAt: string;
  updatedAt: string;
  lastItemActivityAt: string | null;
  items: CartItem[];
}

export interface BuyerListResponse {
  page: number;
  take: number;
  total: number;
  buyers: Buyer[];
}

export interface ShippingAddressListResponse {
  page: number;
  take: number;
  total: number;
  addresses: ShippingAddress[];
}

export interface CartListResponse {
  page: number;
  take: number;
  total: number;
  carts: Cart[];
}

export interface BuyerDetailResponse {
  buyer: Buyer;
}

export interface BuyerShippingAddressesResponse {
  buyerId: string;
  addresses: ShippingAddress[];
}

export interface BuyerCartResponse {
  buyerId: string;
  cart: Cart | null;
}

export interface CartDetailResponse {
  cart: Cart;
}

export type BuyerProfilePatch = Partial<{
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
}>;

export type ShippingAddressPatch = Partial<{
  label: string | null;
  address: string;
  apartment: string | null;
  floor: string | null;
  city: string;
  postalCode: string;
  province: string;
  country: "Argentina";
}>;

async function buyerRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BUYER_API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null) as { error?: string; message?: string } | null;
    throw new Error(body?.message || body?.error || `Error ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function paginationParams(page: number, take: number) {
  return new URLSearchParams({ page: String(page), take: String(take) });
}

export function fetchBuyers(page = 1, take = 10, query = "") {
  const params = paginationParams(page, take);
  if (query.trim()) params.set("q", query.trim());

  return buyerRequest<BuyerListResponse>(`/api/admin/buyers?${params.toString()}`);
}

export function fetchBuyer(buyerId: string) {
  return buyerRequest<BuyerDetailResponse>(`/api/admin/buyers/${encodeURIComponent(buyerId)}`);
}

export function updateBuyer(buyerId: string, data: BuyerProfilePatch) {
  return buyerRequest<BuyerDetailResponse>(`/api/admin/buyers/${encodeURIComponent(buyerId)}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function fetchBuyerShippingAddresses(buyerId: string) {
  return buyerRequest<BuyerShippingAddressesResponse>(
    `/api/admin/buyers/${encodeURIComponent(buyerId)}/shipping-addresses`,
  );
}

export function fetchBuyerCart(buyerId: string) {
  return buyerRequest<BuyerCartResponse>(`/api/admin/buyers/${encodeURIComponent(buyerId)}/cart`);
}

export function fetchShippingAddresses(page = 1, take = 10) {
  const params = paginationParams(page, take);

  return buyerRequest<ShippingAddressListResponse>(`/api/admin/shipping-addresses?${params.toString()}`);
}

export function updateShippingAddress(addressId: string, data: ShippingAddressPatch) {
  return buyerRequest<{ address: ShippingAddress }>(`/api/admin/shipping-addresses/${encodeURIComponent(addressId)}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteShippingAddress(addressId: string) {
  return buyerRequest<{ deleted: boolean }>(`/api/admin/shipping-addresses/${encodeURIComponent(addressId)}`, {
    method: "DELETE",
  });
}

export function fetchCarts(page = 1, take = 10) {
  const params = paginationParams(page, take);

  return buyerRequest<CartListResponse>(`/api/admin/carts?${params.toString()}`);
}

export function fetchCart(cartId: string) {
  return buyerRequest<CartDetailResponse>(`/api/admin/carts/${encodeURIComponent(cartId)}`);
}

export function deleteCartItem(cartId: string, itemId: string) {
  return buyerRequest<{ deleted: boolean }>(
    `/api/admin/carts/${encodeURIComponent(cartId)}/items/${encodeURIComponent(itemId)}`,
    { method: "DELETE" },
  );
}
