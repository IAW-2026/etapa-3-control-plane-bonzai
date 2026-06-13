"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { BookMarked } from "lucide-react";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Table, TableRow } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <StatCard icon={<BookMarked size={16} />} value={data?.total ?? "—"} label="Total Reservations" />
      </div>
      <div className="mb-6 sm:max-w-xs"><StatusFilter value={status} /></div>
      {loading ? <Spinner /> : !data?.reservations?.length ? <EmptyState title="No reservations found" /> : <>
        <Table headers={headers}>
          {data.reservations.map((r: any) => (
            <TableRow key={r.id} gridTemplate={headers.map((h) => h.width).join(" ")} columns={[
              <span className="font-mono text-xs text-[var(--color-text-muted)]">{r.productId?.slice(0, 10)}</span>,
              <span>{r.quantity}</span>,
              <Badge variant={statusVariant[r.status] || "default"}>{r.status}</Badge>,
              <span className="text-xs text-[var(--color-text-muted)]">{formatDate(r.createdAt)}</span>,
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
    <select value={value} onChange={(e) => setStatus(e.target.value)} className="w-full sm:w-auto px-3 py-[0.6rem] text-sm border-[1.5px] border-[var(--color-border)] rounded-xl outline-none bg-white">
      <option value="">All Status</option>
      <option value="ACTIVE">Active</option>
      <option value="COMPLETED">Completed</option>
      <option value="CANCELLED">Cancelled</option>
      <option value="EXPIRED">Expired</option>
    </select>
  );
}
