"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { fetchIncidents } from "@/services/shipping-actions";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { StatCard } from "@/components/ui/StatCard/StatCard";
import { Table, TableRow } from "@/components/ui/Table/Table";
import { Pagination } from "@/components/ui/Pagination/Pagination";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { Badge } from "@/components/ui/Badge/Badge";
import styles from "./page.module.css";

const headers = [
  { label: "ID", width: "0.8fr" },
  { label: "Tracking", width: "1fr" },
  { label: "Order", width: "0.8fr" },
  { label: "Driver", width: "1fr" },
  { label: "Operator", width: "1fr" },
  { label: "Created", width: "1.2fr" },
];

export default function IncidentsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = parseInt(searchParams.get("page") || "1", 10);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchIncidents(page, 10)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [page]);

  const shipments = data?.data || [];
  const meta = data?.meta || {};
  const total = meta.total_records ?? 0;

  return (
    <div>
      <PageHeader title="Incidents" italic="" description="Cancelled shipments requiring immediate attention." />

      <div className={styles.statGrid}>
        <StatCard icon={<AlertTriangle size={16} />} value={total} label="Cancelled Shipments" warning />
      </div>

      {loading ? (
        <Spinner />
      ) : !shipments.length ? (
        <EmptyState title="No incidents found" hint="All shipments are healthy." />
      ) : (
        <>
          <Table headers={headers}>
            {shipments.map((s: any) => (
              <TableRow
                key={s.id}
                onClick={() => router.push(`/dashboard/shipping/shipments/${s.id}`)}
                columns={[
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{s.id?.slice(0, 8)}</span>,
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", fontWeight: 600 }}>{s.tracking_id || "—"}</span>,
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{s.order_id?.slice(0, 8) || "—"}</span>,
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{s.driver_id?.slice(0, 8) || "—"}</span>,
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{s.operator_id?.slice(0, 8) || "—"}</span>,
                  <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{formatDate(s.created_at)}</span>,
                ]}
              />
            ))}
          </Table>
          <Pagination total={total} page={page} limit={10} />
        </>
      )}
    </div>
  );
}
