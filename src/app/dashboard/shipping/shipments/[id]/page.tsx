"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { fetchShipments, updateShipmentStatus } from "@/services/shipping-actions";
import { formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/Card/Card";
import { Badge } from "@/components/ui/Badge/Badge";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import Button from "@/components/ui/Button/Button";
import { Modal } from "@/components/ui/Modal/Modal";
import styles from "./page.module.css";

const statusVariant: Record<string, "default" | "primary" | "success" | "warning" | "error"> = {
  PENDING: "warning",
  ASSIGNED: "primary",
  IN_TRANSIT: "primary",
  DELIVERED: "success",
  CANCELLED: "error",
};

const allowedTransitions: Record<string, string[]> = {
  PENDING: ["ASSIGNED", "CANCELLED"],
  ASSIGNED: ["IN_TRANSIT", "CANCELLED"],
  IN_TRANSIT: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

export default function ShipmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [shipment, setShipment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusModal, setStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [acting, setActing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let found: any = null;
      let pageNum = 1;
      const perPage = 50;

      while (true) {
        const result = await fetchShipments(pageNum, perPage);
        const items = result?.data ?? [];
        found = items.find((s: any) => s.id === id);
        if (found) break;
        const totalPages = result?.meta?.total_pages ?? 0;
        if (pageNum >= totalPages || items.length === 0) break;
        pageNum++;
      }

      if (found) {
        setShipment(found);
      } else {
        setShipment(null);
        setError(`Shipment not found in list (searched ${pageNum} pages, ID: ${id.slice(0, 8)}...)`);
      }
    } catch (e: any) {
      setShipment(null);
      setError(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async () => {
    if (!newStatus) return;
    setActing(true);
    try {
      await updateShipmentStatus(id, newStatus);
      setStatusModal(false);
      load();
    } catch {
      alert("Failed to update status");
    }
    setActing(false);
  };

  if (loading) return <Spinner />;
  if (!shipment) {
    return (
      <div style={{ textAlign: "center", padding: "3rem 0" }}>
        <p style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-serif)", fontSize: "1rem" }}>Shipment not found.</p>
        {error && <p style={{ fontSize: "0.75rem", color: "#aaa", marginTop: "0.5rem" }}>{error}</p>}
        <Link href="/dashboard/shipping/shipments" className={styles.backLink} style={{ justifyContent: "center", marginTop: "1rem" }}>
          <ArrowLeft size={14} />
          Back to Shipments
        </Link>
      </div>
    );
  }

  const s = shipment;

  return (
    <div>
      <Link href="/dashboard/shipping/shipments" className={styles.backLink}>
        <ArrowLeft size={14} />
        Back to Shipments
      </Link>

      <PageHeader title="Shipment" italic={s.tracking_id || s.id?.slice(0, 8)} />

      <div className={styles.cardGrid}>
        <Card padding="lg">
          <h3 className={styles.sectionTitle}>Status</h3>
          <Badge variant={statusVariant[s.status] || "default"} size="lg">{s.status}</Badge>
          <div className={styles.statusActions}>
            {allowedTransitions[s.status]?.length > 0 && (
              <Button size="sm" variant="secondary" onClick={() => setStatusModal(true)}>Change Status</Button>
            )}
          </div>
        </Card>

        <Card padding="lg">
          <h3 className={styles.sectionTitle}>Details</h3>
          <div className={styles.detailGrid}>
            <div className={styles.detailRow}><span className={styles.detailLabel}>Tracking ID</span><span style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", fontWeight: 600 }}>{s.tracking_id || "—"}</span></div>
            <div className={styles.detailRow}><span className={styles.detailLabel}>Order ID</span><span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>{s.order_id?.slice(0, 16) || "—"}</span></div>
            <div className={styles.detailRow}><span className={styles.detailLabel}>Type</span><span>{s.type || "—"}</span></div>
            <div className={styles.detailRow}><span className={styles.detailLabel}>Seller</span><span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>{s.seller_id?.slice(0, 12) || "—"}</span></div>
            <div className={styles.detailRow}><span className={styles.detailLabel}>Buyer</span><span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>{s.buyer_id?.slice(0, 12) || "—"}</span></div>
            <div className={styles.detailRow}><span className={styles.detailLabel}>Driver</span><span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>{s.driver_id?.slice(0, 12) || "—"}</span></div>
            <div className={styles.detailRow}><span className={styles.detailLabel}>Operator</span><span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>{s.operator_id?.slice(0, 12) || "—"}</span></div>
            <div className={styles.detailRow}><span className={styles.detailLabel}>Created</span><span>{formatDate(s.created_at)}</span></div>
          </div>
        </Card>

        <Card padding="lg">
          <h3 className={styles.sectionTitle}>Tracking Events</h3>
          {s.tracking_events?.length ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {s.tracking_events.map((e: any, i: number) => (
                <div key={i} className={styles.timelineEntry}>
                  <div className={styles.timelineDot}>
                    <div className={styles.timelineInnerDot} />
                  </div>
                  <div>
                    <Badge variant={statusVariant[e.status] || "default"} size="sm">{e.status}</Badge>
                    {e.description && <p className={styles.timelineDetail}>{e.description}</p>}
                    <p className={styles.timelineDate}>{formatDate(e.timestamp || e.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>No tracking events available.</p>}
        </Card>
      </div>

      <Modal open={statusModal} onClose={() => setStatusModal(false)} title="Change Shipment Status" description={`Current: ${s.status}. Select a new status.`}
        actions={<>
          <button onClick={() => setStatusModal(false)} className={`${styles.modalBtn} ${styles.modalBtnSecondary}`}>Cancel</button>
          <button onClick={handleStatusChange} disabled={!newStatus || acting} className={`${styles.modalBtn} ${styles.modalBtnPrimary}`}>Confirm</button>
        </>}
      >
        <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className={styles.select}>
          <option value="">Select status...</option>
          {(allowedTransitions[s.status] || []).map((st) => (
            <option key={st} value={st}>{st}</option>
          ))}
        </select>
      </Modal>
    </div>
  );
}
