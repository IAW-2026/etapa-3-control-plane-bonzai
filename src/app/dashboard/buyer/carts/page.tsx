"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Package, ShoppingCart } from "lucide-react";
import { fetchCarts, type CartListResponse } from "@/services/buyer-actions";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { StatCard } from "@/components/ui/StatCard/StatCard";
import { Table, TableRow } from "@/components/ui/Table/Table";
import { Pagination } from "@/components/ui/Pagination/Pagination";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { Badge } from "@/components/ui/Badge/Badge";
import styles from "../buyer.module.css";

const headers = [
  { label: "Cart", width: "1.2fr" },
  { label: "Buyer", width: "1.2fr" },
  { label: "Status", width: "0.9fr" },
  { label: "Items", width: "0.8fr" },
  { label: "Quantity", width: "0.8fr" },
  { label: "Updated", width: "1.2fr" },
];

export default function CartsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1", 10);
  const [data, setData] = useState<CartListResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadCarts() {
      await Promise.resolve();
      if (!active) return;

      setLoading(true);
      try {
        const result = await fetchCarts(page, 10);
        if (active) setData(result);
      } catch {
        if (active) setData(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadCarts();
    return () => { active = false; };
  }, [page]);

  const carts = data?.carts ?? [];
  const activeCarts = carts.filter((cart) => !cart.isEmpty).length;
  const totalItems = carts.reduce((total, cart) => total + cart.itemCount, 0);
  const totalQuantity = carts.reduce((total, cart) => total + cart.totalQuantity, 0);

  return (
    <div>
      <PageHeader title="Carts" italic="" description="Buyer carts from the admin endpoint." />

      <div className={styles.statGrid}>
        <StatCard icon={<ShoppingCart size={16} />} value={data?.total ?? "—"} label="Total Carts" />
        <StatCard icon={<ShoppingCart size={16} />} value={activeCarts} label="Active Loaded" />
        <StatCard icon={<Package size={16} />} value={totalItems} label="Items Loaded" />
        <StatCard icon={<Package size={16} />} value={totalQuantity} label="Quantity Loaded" />
      </div>

      {loading ? (
        <Spinner />
      ) : !carts.length ? (
        <EmptyState title="No carts found" />
      ) : (
        <>
          <Table headers={headers}>
            {carts.map((cart) => (
              <TableRow
                key={cart.id}
                onClick={() => router.push(`/dashboard/buyer/carts/${cart.id}`)}
                columns={[
                  <span key="cart" className={styles.monoText}>{cart.id.slice(0, 12)}</span>,
                  <Link key="buyer" href={`/dashboard/buyer/buyers/${cart.buyerId}`} onClick={(event) => event.stopPropagation()} className={styles.linkText}>{buyerDisplayName(cart)}</Link>,
                  <Badge key="status" variant={cart.isEmpty ? "default" : "primary"}>{cart.isEmpty ? "Empty" : "Active"}</Badge>,
                  <span key="items" className={styles.primaryText}>{cart.itemCount}</span>,
                  <span key="quantity" className={styles.primaryText}>{cart.totalQuantity}</span>,
                  <span key="updated" className={styles.mutedText}>{safeFormatDate(cart.updatedAt)}</span>,
                ]}
              />
            ))}
          </Table>
          <Pagination total={data?.total ?? 0} page={page} limit={10} />
        </>
      )}
    </div>
  );
}

function buyerDisplayName(cart: NonNullable<CartListResponse["carts"]>[number]) {
  const name = [cart.buyer?.firstName, cart.buyer?.lastName].filter(Boolean).join(" ").trim();
  return name || cart.buyerId.slice(0, 12);
}

function safeFormatDate(value: string | null | undefined) {
  return value ? formatDate(value) : "—";
}
