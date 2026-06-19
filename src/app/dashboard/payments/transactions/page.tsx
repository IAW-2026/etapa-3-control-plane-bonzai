"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowRightLeft, DollarSign } from "lucide-react";
import { fetchTransactions } from "@/services/payments-actions";
import { formatARS, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { StatCard } from "@/components/ui/StatCard/StatCard";
import { Table, TableRow } from "@/components/ui/Table/Table";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { Pagination } from "@/components/ui/Pagination/Pagination";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { Badge } from "@/components/ui/Badge/Badge";
import styles from "./page.module.css";

const statusVariant: Record<string, "default" | "primary" | "success" | "warning" | "error"> = {
  PENDING: "warning",
  HELD: "primary",
  DELIVERED: "success",
  COMPLETED: "success",
  DISPUTED: "error",
  REFUNDED: "default",
};

const headers = [
  { label: "ID", width: "0.8fr" },
  { label: "Order", width: "1fr" },
  { label: "Status", width: "0.8fr" },
  { label: "Amount", width: "1fr" },
  { label: "Commission", width: "0.8fr" },
  { label: "Net", width: "1fr" },
  { label: "Date", width: "1.2fr" },
];

export default function TransactionsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = parseInt(searchParams.get("page") || "1", 10);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchTransactions(page, 10, status, search)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [page, search, status]);

  const pagination = data?.pagination || {};

  return (
    <div>
      <PageHeader title="Transactions" italic="" description="All payment transactions across the platform." />

      <div className={styles.statGrid}>
        <StatCard icon={<ArrowRightLeft size={16} />} value={pagination.total ?? "—"} label="Total Transactions" />
        <StatCard icon={<DollarSign size={16} />} value={data?.transactions?.length ? formatARS(data.transactions.reduce((s: number, t: any) => s + (t.amount || 0), 0)) : "—"} label="Page Volume" />
      </div>

      <div className={styles.filterRow}>
        <div className={styles.searchWrapper}>
          <SearchInput placeholder="Search by Order ID..." />
        </div>
        <TransactionStatusFilter value={status} />
      </div>

      {loading ? (
        <Spinner />
      ) : !data?.transactions?.length ? (
        <EmptyState title="No transactions found" />
      ) : (
        <>
          <Table headers={headers}>
            {data.transactions.map((t: any) => (
              <TableRow
                key={t.id}
                onClick={() => router.push(`/dashboard/payments/transactions/${t.id}`)}
                columns={[
                  <span key="id" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{t.id?.slice(0, 8)}</span>,
                  <span key="order" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>{t.orderId || "—"}</span>,
                  <Badge key="status" variant={statusVariant[t.status] || "default"}>{t.status}</Badge>,
                  <span key="amount" style={{ fontFamily: "var(--font-serif)", fontSize: "0.875rem", fontWeight: 500 }}>{formatARS(t.amount)}</span>,
                  <span key="comm" style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{formatARS(t.commissionAmount)}</span>,
                  <span key="net" style={{ fontFamily: "var(--font-serif)", fontSize: "0.875rem", fontWeight: 500 }}>{formatARS(t.netAmount)}</span>,
                  <span key="date" style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{formatDate(t.createdAt)}</span>,
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

function TransactionStatusFilter({ value }: { value: string }) {
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
      <option value="HELD">Held</option>
      <option value="DELIVERED">Delivered</option>
      <option value="COMPLETED">Completed</option>
      <option value="DISPUTED">Disputed</option>
      <option value="REFUNDED">Refunded</option>
    </select>
  );
}
