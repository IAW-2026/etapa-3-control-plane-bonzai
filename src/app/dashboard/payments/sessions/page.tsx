"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchCheckoutSessions } from "@/services/payments-actions";
import { formatARS, formatDate, useSafePage } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { Table, TableRow } from "@/components/ui/Table/Table";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { Pagination } from "@/components/ui/Pagination/Pagination";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { Badge } from "@/components/ui/Badge/Badge";
import styles from "./page.module.css";

const statusVariant: Record<string, "default" | "primary" | "success" | "warning" | "error"> = {
  PENDING: "warning",
  PAID: "primary",
  COMPLETED: "success",
  EXPIRED: "error",
};

const headers = [
  { label: "ID", width: "0.8fr" },
  { label: "Buyer", width: "1.2fr" },
  { label: "Total", width: "1fr" },
  { label: "Status", width: "0.8fr" },
  { label: "Transactions", width: "0.8fr" },
  { label: "Provider", width: "0.8fr" },
  { label: "Date", width: "1.2fr" },
];

export default function CheckoutSessionsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = useSafePage();
  const status = searchParams.get("status") || "";
  const buyerId = searchParams.get("search") || "";
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchCheckoutSessions(page, 10, status, buyerId)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [page, status, buyerId]);

  useEffect(() => {
    if (!data) return;
    const results = data?.sessions;
    const total = data?.pagination?.total;
    if (!Array.isArray(results) || results.length > 0) return;
    if (page <= 1) return;
    let target = 1;
    if (total && total > 0) {
      const totalPages = Math.ceil(total / 10);
      target = page <= totalPages ? page : totalPages;
    }
    if (target === page) return;
    const url = new URL(window.location.href);
    url.searchParams.set("page", String(target));
    router.replace(url.pathname + url.search);
  }, [data, page]);

  const pagination = data?.pagination || {};

  return (
    <div>
      <PageHeader title="Checkout" italic="Sessions" description="Multi-vendor checkout sessions and payment processing." />

      <div className={styles.filterRow}>
        <div className={styles.searchWrapper}>
          <SearchInput placeholder="Search by Buyer ID..." />
        </div>
        <SessionStatusFilter value={status} />
      </div>

      {loading ? (
        <Spinner />
      ) : !data?.sessions?.length ? (
        <EmptyState title="No checkout sessions found" />
      ) : (
        <>
          <Table headers={headers}>
            {data.sessions.map((s: any) => (
              <TableRow
                key={s.id}
                onClick={() => router.push(`/dashboard/payments/sessions/${s.id}`)}
                columns={[
                  <span key="id" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{s.id?.slice(0, 8)}</span>,
                  <span key="buyer" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>{s.buyerId?.slice(0, 14) || "—"}</span>,
                  <span key="total" style={{ fontFamily: "var(--font-serif)", fontSize: "0.875rem", fontWeight: 500 }}>{formatARS(s.totalAmount)}</span>,
                  <Badge key="status" variant={statusVariant[s.status] || "default"}>{s.status}</Badge>,
                  <span key="txcount" style={{ fontSize: "0.875rem", fontWeight: 500 }}>{s.transactionCount ?? "—"}</span>,
                  <span key="provider" style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{s.payments?.[0]?.provider || "—"}</span>,
                  <span key="date" style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{formatDate(s.createdAt)}</span>,
                ]}
              />
            ))}
          </Table>
          <Pagination total={pagination.total || 0} page={page} limit={10} />
        </>
      )}
    </div>
  );
}

function SessionStatusFilter({ value }: { value: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setStatus = (s: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (s) params.set("status", s);
    else params.delete("status");
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  return (
    <select value={value} onChange={(e) => setStatus(e.target.value)} className={styles.select}>
      <option value="">All Status</option>
      <option value="PENDING">Pending</option>
      <option value="PAID">Paid</option>
      <option value="COMPLETED">Completed</option>
      <option value="EXPIRED">Expired</option>
    </select>
  );
}
