"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { BookMarked } from "lucide-react";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { StatCard } from "@/components/ui/StatCard/StatCard";
import { Table, TableRow } from "@/components/ui/Table/Table";
import { Pagination } from "@/components/ui/Pagination/Pagination";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { Badge } from "@/components/ui/Badge/Badge";
import Button from "@/components/ui/Button/Button";
import styles from "./page.module.css";

const statusVariant: Record<string, "default" | "primary" | "success" | "warning" | "error"> = {
  ACTIVE: "primary", COMPLETED: "success", CANCELLED: "error", EXPIRED: "warning",
};

const headers = [
  { label: "Product ID", width: "2fr" },
  { label: "Quantity", width: "1fr" },
  { label: "Status", width: "1fr" },
  { label: "Created", width: "1.5fr" },
  { label: "Actions", width: "1fr" },
];

export default function ReservationsPage() {
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1", 10);
  const status = searchParams.get("status") || "";
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const load = () => { setLoading(true); api.getReservations(page, 10, status).then(setData).catch(() => setData(null)).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, [page, status]);
  const handleRelease = async (id: string) => { if (!confirm("Release this reservation? Stock will be restored.")) return; try { await api.releaseReservation(id); load(); } catch { alert("Failed to release"); } };

  return (
    <div>
      <PageHeader title="Reservations" italic="" description="Inventory reservations across the platform." />
      <div className={styles.statGrid}>
        <StatCard icon={<BookMarked size={16} />} value={data?.total ?? "—"} label="Total Reservations" />
      </div>
      <div className={styles.filterWrapper}><StatusFilter value={status} /></div>
      {loading ? <Spinner /> : !data?.reservations?.length ? <EmptyState title="No reservations found" /> : <>
        <Table headers={headers}>
          {data.reservations.map((r: any) => (
            <TableRow key={r.id} columns={[
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{r.productId?.slice(0, 10)}</span>,
              <span>{r.quantity}</span>,
              <Badge variant={statusVariant[r.status] || "default"}>{r.status}</Badge>,
              <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{formatDate(r.createdAt)}</span>,
              <div>{r.status === "ACTIVE" && <Button size="sm" variant="ghost" onClick={() => handleRelease(r.id)}>Release</Button>}</div>,
            ]} />
          ))}
        </Table>
        <Pagination total={data.total} page={page} limit={10} />
      </>}
    </div>
  );
}

function StatusFilter({ value }: { value: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setStatus = (s: string) => { const params = new URLSearchParams(searchParams.toString()); if (s) params.set("status", s); else params.delete("status"); params.set("page", "1"); router.push(`?${params.toString()}`); };
  return (
    <select value={value} onChange={(e) => setStatus(e.target.value)} className={styles.select}>
      <option value="">All Status</option>
      <option value="ACTIVE">Active</option>
      <option value="COMPLETED">Completed</option>
      <option value="CANCELLED">Cancelled</option>
      <option value="EXPIRED">Expired</option>
    </select>
  );
}
