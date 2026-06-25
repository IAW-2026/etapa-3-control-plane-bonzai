"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, MapPin, ShoppingCart, Users } from "lucide-react";
import { fetchBuyers, type BuyerListResponse } from "@/services/buyer-actions";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { StatCard } from "@/components/ui/StatCard/StatCard";
import { Table, TableRow } from "@/components/ui/Table/Table";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { Pagination } from "@/components/ui/Pagination/Pagination";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { Badge } from "@/components/ui/Badge/Badge";
import styles from "../buyer.module.css";

const headers = [
  { label: "Buyer", width: "1.6fr" },
  { label: "Phone", width: "1fr" },
  { label: "Profile", width: "0.9fr" },
  { label: "Addresses", width: "0.8fr" },
  { label: "Cart", width: "0.9fr" },
  { label: "Created", width: "1.2fr" },
];

export default function BuyersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1", 10);
  const query = searchParams.get("q") || "";
  const [data, setData] = useState<BuyerListResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadBuyers() {
      await Promise.resolve();
      if (!active) return;

      setLoading(true);
      try {
        const result = await fetchBuyers(page, 10, query);
        if (active) setData(result);
      } catch {
        if (active) setData(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadBuyers();
    return () => { active = false; };
  }, [page, query]);

  const buyers = data?.buyers ?? [];
  const completeProfiles = buyers.filter((buyer) => buyer.isProfileComplete).length;
  const addressCount = buyers.reduce((total, buyer) => total + (buyer.addressCount ?? 0), 0);
  const cartQuantity = buyers.reduce((total, buyer) => total + (buyer.cartQuantity ?? 0), 0);

  return (
    <div>
      <PageHeader title="Buyers" italic="" description="Buyer profiles from the buyer admin API." />

      <div className={styles.statGrid}>
        <StatCard icon={<Users size={16} />} value={data?.total ?? "—"} label="Total Buyers" />
        <StatCard icon={<CheckCircle size={16} />} value={completeProfiles} label="Complete Loaded" />
        <StatCard icon={<MapPin size={16} />} value={addressCount} label="Addresses Loaded" />
        <StatCard icon={<ShoppingCart size={16} />} value={cartQuantity} label="Cart Quantity Loaded" />
      </div>

      <div className={styles.filterRow}>
        <div className={styles.searchWrapper}>
          <SearchInput param="q" placeholder="Search by buyer ID, Clerk ID, name or phone..." />
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : !buyers.length ? (
        <EmptyState title="No buyers found" />
      ) : (
        <>
          <Table headers={headers}>
            {buyers.map((buyer) => (
              <TableRow
                key={buyer.id}
                onClick={() => router.push(`/dashboard/buyer/buyers/${buyer.id}`)}
                columns={[
                  <span key="buyer" className={styles.primaryText}>{buyerDisplayName(buyer.firstName, buyer.lastName, buyer.id)}</span>,
                  <span key="phone" className={styles.monoText}>{buyer.phone || "—"}</span>,
                  <Badge key="profile" variant={buyer.isProfileComplete ? "success" : "warning"}>{buyer.isProfileComplete ? "Complete" : "Incomplete"}</Badge>,
                  <span key="addresses" className={styles.mutedText}>{buyer.addressCount ?? 0}</span>,
                  <Badge key="cart" variant={buyer.hasCart ? "primary" : "default"}>{buyer.hasCart ? `${buyer.cartItemCount ?? 0} items` : "No cart"}</Badge>,
                  <span key="created" className={styles.mutedText}>{safeFormatDate(buyer.createdAt)}</span>,
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

function buyerDisplayName(firstName: string | null, lastName: string | null, fallbackId: string) {
  const name = [firstName, lastName].filter(Boolean).join(" ").trim();
  return name || fallbackId.slice(0, 12);
}

function safeFormatDate(value: string | null | undefined) {
  return value ? formatDate(value) : "—";
}
