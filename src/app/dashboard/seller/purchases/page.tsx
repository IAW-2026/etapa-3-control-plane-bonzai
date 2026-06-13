"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CreditCard, DollarSign } from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { StatCard } from "@/components/ui/StatCard/StatCard";
import { Table, TableRow } from "@/components/ui/Table/Table";
import { Pagination } from "@/components/ui/Pagination/Pagination";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { Badge } from "@/components/ui/Badge/Badge";
import styles from "./page.module.css";

const headers = [
  { label: "ID", width: "1.5fr" },
  { label: "Date", width: "1.5fr" },
  { label: "Orders", width: "1fr" },
  { label: "Items", width: "1fr" },
  { label: "Total", width: "1fr" },
];

export default function PurchasesPage() {
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1", 10);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getPurchases(page)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div>
      <PageHeader title="Purchases" italic="" description="All purchases across the platform." />

      <div className={styles.statGrid}>
        <StatCard icon={<CreditCard size={16} />} value={data?.total ?? "—"} label="Total Purchases" />
      </div>

      {loading ? (
        <Spinner />
      ) : !data?.purchases?.length ? (
        <EmptyState title="No purchases yet" />
      ) : (
        <>
          <Table headers={headers}>
            {data.purchases.map((p: any) => (
              <TableRow
                key={p.id}
                columns={[
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{p.id.slice(0, 8)}</span>,
                  <span style={{ fontSize: "0.875rem" }}>{formatDate(p.createdAt)}</span>,
                  <Badge variant="primary">{p.orders?.length || 0}</Badge>,
                  <span>{(p.orders || []).reduce((s: number, o: any) => s + (o.items?.length || 0), 0)}</span>,
                  <span style={{ fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: "0.875rem" }}>
                    {formatCurrency((p.orders || []).reduce((s: number, o: any) => s + o.total, 0))}
                  </span>,
                ]}
              />
            ))}
          </Table>
          <Pagination total={data.total} page={page} limit={10} />
        </>
      )}
    </div>
  );
}
