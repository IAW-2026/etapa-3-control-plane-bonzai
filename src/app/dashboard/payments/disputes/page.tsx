"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchDisputes } from "@/services/payments-actions";
import { formatARS, formatDate, useSafePage } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { Table, TableRow } from "@/components/ui/Table/Table";
import { Pagination } from "@/components/ui/Pagination/Pagination";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { Badge } from "@/components/ui/Badge/Badge";
import styles from "./page.module.css";

const headers = [
  { label: "ID", width: "0.7fr" },
  { label: "Order", width: "1fr" },
  { label: "Reason", width: "1.2fr" },
  { label: "Resolution", width: "1fr" },
  { label: "Amount", width: "0.8fr" },
  { label: "Date", width: "1.2fr" },
];

export default function DisputesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = useSafePage();
  const status = searchParams.get("status") || "";
  const reason = searchParams.get("reason") || "";
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchDisputes(page, 10, status, reason)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [page, status, reason]);

  useEffect(() => {
    if (!data) return;
    const results = data?.disputes;
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
      <PageHeader title="Disputes" italic="" description="All transaction disputes and resolutions." />

      <div className={styles.filterRow}>
        <DisputeStatusFilter value={status} />
        <DisputeReasonFilter value={reason} />
      </div>

      {loading ? (
        <Spinner />
      ) : !data?.disputes?.length ? (
        <EmptyState title="No disputes found" />
      ) : (
        <>
          <Table headers={headers}>
            {data.disputes.map((d: any) => (
              <TableRow
                key={d.id}
                onClick={() => router.push(`/dashboard/payments/transactions/${d.transactionId}`)}
                columns={[
                  <span key="id" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{d.id?.slice(0, 8)}</span>,
                  <span key="order" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>{d.transaction?.orderId || "—"}</span>,
                  <Badge key="reason" variant="error" size="sm">{d.reason?.replace(/_/g, " ")}</Badge>,
                  d.resolution
                    ? <Badge key="res" variant="success" size="sm">{d.resolution.replace(/_/g, " ")}</Badge>
                    : <span key="res" style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Pending</span>,
                  <span key="amount" style={{ fontFamily: "var(--font-serif)", fontSize: "0.875rem", fontWeight: 500 }}>{d.transaction?.amount != null ? formatARS(d.transaction.amount) : "—"}</span>,
                  <span key="date" style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{formatDate(d.createdAt)}</span>,
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

function DisputeStatusFilter({ value }: { value: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const set = (s: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (s) params.set("status", s);
    else params.delete("status");
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  return (
    <select value={value} onChange={(e) => set(e.target.value)} className={styles.select}>
      <option value="">All Status</option>
      <option value="pending">Pending</option>
      <option value="resolved">Resolved</option>
    </select>
  );
}

function DisputeReasonFilter({ value }: { value: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const set = (s: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (s) params.set("reason", s);
    else params.delete("reason");
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  return (
    <select value={value} onChange={(e) => set(e.target.value)} className={styles.select}>
      <option value="">All Reasons</option>
      <option value="ITEM_NOT_RECEIVED">Item Not Received</option>
      <option value="ITEM_DAMAGED">Item Damaged</option>
      <option value="ITEM_NOT_AS_DESCRIBED">Not As Described</option>
      <option value="OTHER">Other</option>
    </select>
  );
}
