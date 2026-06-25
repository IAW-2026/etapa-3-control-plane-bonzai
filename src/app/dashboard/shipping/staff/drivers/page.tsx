"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Truck } from "lucide-react";
import { fetchDrivers, updateDriverStatus } from "@/services/shipping-actions";
import { useSafePage } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { StatCard } from "@/components/ui/StatCard/StatCard";
import { Table, TableRow } from "@/components/ui/Table/Table";
import { Pagination } from "@/components/ui/Pagination/Pagination";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { Badge } from "@/components/ui/Badge/Badge";
import Button from "@/components/ui/Button/Button";
import { Modal } from "@/components/ui/Modal/Modal";
import styles from "./page.module.css";

const statusVariant: Record<string, "default" | "primary" | "success" | "warning" | "error"> = {
  AVAILABLE: "success",
  ACTIVE: "success",
  INACTIVE: "warning",
  SUSPENDED: "error",
  ON_DELIVERY: "primary",
};

const headers = [
  { label: "Name", width: "1.5fr" },
  { label: "Email", width: "2fr" },
  { label: "Status", width: "1fr" },
  { label: "Shipments", width: "1fr" },
  { label: "Actions", width: "1fr" },
];

export default function DriversPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = useSafePage();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState<{ id: string; action: "activate" | "deactivate" } | null>(null);
  const [acting, setActing] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetchDrivers(page, 10)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!data) return;
    const results = data?.data;
    const total = data?.meta?.total_records;
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

  const handleToggleStatus = async () => {
    if (!confirmModal) return;
    setActing(true);
    try {
      const newStatus = confirmModal.action === "activate" ? "ACTIVE" : "INACTIVE";
      await updateDriverStatus(confirmModal.id, newStatus);
      setConfirmModal(null);
      load();
    } catch {
      alert("Action failed");
    }
    setActing(false);
  };

  const drivers = data?.data || [];
  const meta = data?.meta || {};
  const total = meta.total_records ?? 0;

  const isActiveStatus = (status: string) => status === "AVAILABLE" || status === "ACTIVE" || status === "ON_DELIVERY";

  return (
    <div>
      <PageHeader title="Drivers" italic="" description="Field curators responsible for physical plant transport." />

      <div className={styles.statGrid}>
        <StatCard icon={<Truck size={16} />} value={total} label="Total Drivers" />
      </div>

      {loading ? (
        <Spinner />
      ) : !drivers.length ? (
        <EmptyState title="No drivers found" />
      ) : (
        <>
          <Table headers={headers}>
            {drivers.map((d: any) => (
              <TableRow
                key={d.id}
                onClick={() => router.push(`/dashboard/shipping/staff/drivers/${d.id}`)}
                columns={[
                  <span style={{ fontFamily: "var(--font-serif)", fontSize: "0.875rem", fontWeight: 500 }}>{d.name || d.first_name ? `${d.first_name || ""} ${d.last_name || ""}` : d.email || "—"}</span>,
                  <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{d.email || "—"}</span>,
                  <Badge variant={statusVariant[d.status] || "default"}>{d.status}</Badge>,
                  <span style={{ fontFamily: "var(--font-serif)", fontSize: "0.875rem", fontWeight: 500 }}>{d.shipments_count ?? "—"}</span>,
                  <span onClick={(e) => e.stopPropagation()}>
                    {isActiveStatus(d.status) ? (
                      <Button size="sm" variant="ghost" onClick={() => setConfirmModal({ id: d.id, action: "deactivate" })}>Deactivate</Button>
                    ) : (
                      <Button size="sm" variant="secondary" onClick={() => setConfirmModal({ id: d.id, action: "activate" })}>Activate</Button>
                    )}
                  </span>,
                ]}
              />
            ))}
          </Table>
          <Pagination total={total} page={page} limit={10} />
        </>
      )}

      <Modal open={!!confirmModal} onClose={() => setConfirmModal(null)}
        title={confirmModal?.action === "activate" ? "Activate Driver" : "Deactivate Driver"}
        description={confirmModal?.action === "activate" ? "This will make the driver available for assignments." : "This will prevent the driver from receiving new assignments."}
        actions={<>
          <button onClick={() => setConfirmModal(null)} className={`${styles.modalBtn} ${styles.modalBtnSecondary}`}>Cancel</button>
          <button onClick={handleToggleStatus} disabled={acting} className={`${styles.modalBtn} ${styles.modalBtnPrimary}`}>{acting ? "..." : "Confirm"}</button>
        </>}
      />
    </div>
  );
}
