"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, UserCog, Package } from "lucide-react";
import Link from "next/link";
import { fetchOperators, fetchOperatorShipments, updateOperatorStatus } from "@/services/shipping-actions";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { StatCard } from "@/components/ui/StatCard/StatCard";
import { Badge } from "@/components/ui/Badge/Badge";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import { Table, TableRow } from "@/components/ui/Table/Table";
import Button from "@/components/ui/Button/Button";
import { Modal } from "@/components/ui/Modal/Modal";
import styles from "./page.module.css";

const statusVariant: Record<string, "default" | "primary" | "success" | "warning" | "error"> = {
  ACTIVE: "success",
  INACTIVE: "warning",
  SUSPENDED: "error",
};

const shipmentStatusVariant: Record<string, "default" | "primary" | "success" | "warning" | "error"> = {
  PENDING: "warning",
  ASSIGNED: "primary",
  IN_TRANSIT: "primary",
  DELIVERED: "success",
  CANCELLED: "error",
};

const headers = [
  { label: "Tracking", width: "1fr" },
  { label: "Order", width: "1fr" },
  { label: "Driver", width: "1fr" },
  { label: "Status", width: "1fr" },
  { label: "Created", width: "1.5fr" },
];

export default function OperatorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [operator, setOperator] = useState<any>(null);
  const [shipments, setShipments] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState<"activate" | "deactivate" | null>(null);
  const [acting, setActing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let found: any = null;
      let pageNum = 1;
      const perPage = 50;

      while (true) {
        const result = await fetchOperators(pageNum, perPage);
        const items = result?.data ?? [];
        found = items.find((o: any) => o.id === id);
        if (found) break;
        const totalPages = result?.meta?.total_pages ?? 0;
        if (pageNum >= totalPages || items.length === 0) break;
        pageNum++;
      }

      if (found) {
        setOperator(found);
        fetchOperatorShipments(id, 1, 20)
          .then(setShipments)
          .catch(() => setShipments(null));
      } else {
        setOperator(null);
        setShipments(null);
      }
    } catch {
      setOperator(null);
      setShipments(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleToggleStatus = async () => {
    if (!confirmModal) return;
    setActing(true);
    try {
      const newStatus = confirmModal === "activate" ? "ACTIVE" : "INACTIVE";
      await updateOperatorStatus(id, newStatus);
      setConfirmModal(null);
      load();
    } catch {
      alert("Action failed");
    }
    setActing(false);
  };

  if (loading) return <Spinner />;
  if (!operator) return <p style={{ textAlign: "center", padding: "3rem 0", color: "var(--color-text-muted)" }}>Operator not found.</p>;

  const shipmentList = shipments?.data || [];
  const meta = shipments?.meta || {};

  return (
    <div>
      <Link href="/dashboard/shipping/staff/operators" className={styles.backLink}>
        <ArrowLeft size={14} /> Back to Operators
      </Link>
      <PageHeader title="Operator" italic={operator.name || operator.email} />

      <div className={styles.statGrid}>
        <StatCard icon={<Package size={16} />} value={meta.total_records ?? shipmentList.length} label="Processed Shipments" />
        <StatCard icon={<UserCog size={16} />} value={operator.status} label="Status" />
      </div>

      <div className={styles.badgeRow}>
        <Badge variant={statusVariant[operator.status] || "default"}>{operator.status}</Badge>
        {operator.status === "ACTIVE" ? (
          <Button size="sm" variant="ghost" onClick={() => setConfirmModal("deactivate")}>Deactivate Operator</Button>
        ) : (
          <Button size="sm" variant="secondary" onClick={() => setConfirmModal("activate")}>Activate Operator</Button>
        )}
      </div>

      {shipmentList.length > 0 && (
        <div style={{ marginBottom: "2rem" }}>
          <h3 className={styles.sectionTitle}>Processed Shipments ({shipmentList.length})</h3>
          <Table headers={headers}>
            {shipmentList.map((s: any) => (
              <TableRow
                key={s.id}
                columns={[
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", fontWeight: 600 }}>{s.tracking_id || "—"}</span>,
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{s.order_id?.slice(0, 8) || "—"}</span>,
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{s.driver_id?.slice(0, 8) || "—"}</span>,
                  <Badge variant={shipmentStatusVariant[s.status] || "default"}>{s.status}</Badge>,
                  <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{formatDate(s.created_at)}</span>,
                ]}
              />
            ))}
          </Table>
        </div>
      )}

      <Modal open={!!confirmModal} onClose={() => setConfirmModal(null)}
        title={confirmModal === "activate" ? "Activate Operator" : "Deactivate Operator"}
        description={confirmModal === "activate" ? "This will allow the operator to process shipments." : "This will prevent the operator from processing new shipments."}
        actions={<>
          <button onClick={() => setConfirmModal(null)} className={`${styles.modalBtn} ${styles.modalBtnSecondary}`}>Cancel</button>
          <button onClick={handleToggleStatus} disabled={acting} className={`${styles.modalBtn} ${styles.modalBtnPrimary}`}>{acting ? "..." : "Confirm"}</button>
        </>}
      />
    </div>
  );
}
