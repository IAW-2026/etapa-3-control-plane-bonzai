"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { UserCog } from "lucide-react";
import { fetchOperators, updateOperatorStatus } from "@/services/shipping-actions";
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
  ACTIVE: "success",
  INACTIVE: "warning",
  SUSPENDED: "error",
};

const headers = [
  { label: "Name", width: "1.5fr" },
  { label: "Email", width: "2fr" },
  { label: "Status", width: "1fr" },
  { label: "Shipments", width: "1fr" },
  { label: "Actions", width: "1fr" },
];

export default function OperatorsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = useSafePage();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState<{ id: string; action: "activate" | "deactivate" } | null>(null);
  const [acting, setActing] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetchOperators(page, 10)
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
      await updateOperatorStatus(confirmModal.id, newStatus);
      setConfirmModal(null);
      load();
    } catch {
      alert("Action failed");
    }
    setActing(false);
  };

  const operators = data?.data || [];
  const meta = data?.meta || {};
  const total = meta.total_records ?? 0;

  return (
    <div>
      <PageHeader title="Operators" italic="" description="Logistics administrators who process and assign shipments." />

      <div className={styles.statGrid}>
        <StatCard icon={<UserCog size={16} />} value={total} label="Total Operators" />
      </div>

      {loading ? (
        <Spinner />
      ) : !operators.length ? (
        <EmptyState title="No operators found" />
      ) : (
        <>
          <Table headers={headers}>
            {operators.map((o: any) => (
              <TableRow
                key={o.id}
                onClick={() => router.push(`/dashboard/shipping/staff/operators/${o.id}`)}
                columns={[
                  <span style={{ fontFamily: "var(--font-serif)", fontSize: "0.875rem", fontWeight: 500 }}>{o.name || o.first_name ? `${o.first_name || ""} ${o.last_name || ""}` : o.email || "—"}</span>,
                  <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{o.email || "—"}</span>,
                  <Badge variant={statusVariant[o.status] || "default"}>{o.status}</Badge>,
                  <span style={{ fontFamily: "var(--font-serif)", fontSize: "0.875rem", fontWeight: 500 }}>{o.shipments_count ?? "—"}</span>,
                  <span onClick={(e) => e.stopPropagation()}>
                    {o.status === "ACTIVE" ? (
                      <Button size="sm" variant="ghost" onClick={() => setConfirmModal({ id: o.id, action: "deactivate" })}>Deactivate</Button>
                    ) : (
                      <Button size="sm" variant="secondary" onClick={() => setConfirmModal({ id: o.id, action: "activate" })}>Activate</Button>
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
        title={confirmModal?.action === "activate" ? "Activate Operator" : "Deactivate Operator"}
        description={confirmModal?.action === "activate" ? "This will allow the operator to process shipments." : "This will prevent the operator from processing new shipments."}
        actions={<>
          <button onClick={() => setConfirmModal(null)} className={`${styles.modalBtn} ${styles.modalBtnSecondary}`}>Cancel</button>
          <button onClick={handleToggleStatus} disabled={acting} className={`${styles.modalBtn} ${styles.modalBtnPrimary}`}>{acting ? "..." : "Confirm"}</button>
        </>}
      />
    </div>
  );
}
