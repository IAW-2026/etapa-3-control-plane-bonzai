"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Package } from "lucide-react";
import { fetchShipments } from "@/services/shipping-actions";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { StatCard } from "@/components/ui/StatCard/StatCard";
import { Table, TableRow } from "@/components/ui/Table/Table";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { Pagination } from "@/components/ui/Pagination/Pagination";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { Badge } from "@/components/ui/Badge/Badge";
import { ExportCsvButton } from "@/components/ui/ExportCsvButton/ExportCsvButton";
import styles from "./page.module.css";

const statusVariant: Record<string, "default" | "primary" | "success" | "warning" | "error"> = {
  PENDING: "warning",
  ASSIGNED: "primary",
  IN_TRANSIT: "primary",
  DELIVERED: "success",
  CANCELLED: "error",
};

const headers = [
  { label: "ID", width: "0.8fr" },
  { label: "Tracking", width: "1fr" },
  { label: "Order", width: "0.8fr" },
  { label: "Status", width: "1fr" },
  { label: "Type", width: "0.8fr" },
  { label: "Driver", width: "1fr" },
  { label: "Operator", width: "1fr" },
  { label: "Created", width: "1.2fr" },
];

export default function ShipmentsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = parseInt(searchParams.get("page") || "1", 10);
  const status = searchParams.get("status") || "";
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchShipments(page, 10, status)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [page, status]);

  const shipments = data?.data || [];
  const meta = data?.meta || {};
  const total = meta.total_records ?? 0;

  return (
    <div>
      <PageHeader title="Shipments" italic="" description="All shipments across the ecosystem." action={<ExportCsvButton filename="shipments.csv" headers={["ID", "Tracking", "Order", "Status", "Type", "Driver", "Operator", "Created"]} rows={shipments.map((s: any) => [s.id?.slice(0, 8) || "", s.tracking_id || "", s.order_id?.slice(0, 8) || "", s.status, s.type, s.driver_id?.slice(0, 8) || "—", s.operator_id?.slice(0, 8) || "—", formatDate(s.created_at)])} />} />

      <div className={styles.statGrid}>
        <StatCard icon={<Package size={16} />} value={total} label="Total Shipments" />
      </div>

      <div className={styles.filterRow}>
        <div className={styles.searchWrapper}>
          <SearchInput placeholder="Search by tracking ID or order ID..." />
        </div>
        <StatusFilter value={status} />
      </div>

      {loading ? (
        <Spinner />
      ) : !shipments.length ? (
        <EmptyState title="No shipments found" />
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
                  <Badge variant={statusVariant[s.status] || "default"}>{s.status}</Badge>,
                  <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{s.type || "—"}</span>,
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

function StatusFilter({ value }: { value: string }) {
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
    <select
      value={value}
      onChange={(e) => setStatus(e.target.value)}
      className={styles.select}
    >
      <option value="">All Status</option>
      <option value="PENDING">Pending</option>
      <option value="ASSIGNED">Assigned</option>
      <option value="IN_TRANSIT">In Transit</option>
      <option value="DELIVERED">Delivered</option>
      <option value="CANCELLED">Cancelled</option>
    </select>
  );
}
