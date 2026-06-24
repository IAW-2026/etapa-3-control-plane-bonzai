"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/Card/Card";
import { Badge } from "@/components/ui/Badge/Badge";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import Button from "@/components/ui/Button/Button";
import { Modal } from "@/components/ui/Modal/Modal";
import styles from "./page.module.css";

const statusVariant: Record<string, "default" | "primary" | "success" | "warning" | "error"> = {
  PENDING: "warning",
  PAID: "primary",
  AWAITING_TRACKING: "warning",
  SHIPPED: "success",
  CANCELLED: "error",
};

const allowedTransitions: Record<string, string[]> = {
  PENDING: ["PAID", "CANCELLED"],
  PAID: [],
  AWAITING_TRACKING: [],
  SHIPPED: [],
  CANCELLED: [],
};

const canRefund = (status: string) => status === "PENDING";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [timeline, setTimeline] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusModal, setStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [refundModal, setRefundModal] = useState(false);
  const [acting, setActing] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.getOrder(id),
      api.getOrderTimeline(id),
    ])
      .then(([o, t]) => { setOrder(o.order || o); setTimeline(t); })
      .catch(() => { setOrder(null); setTimeline(null); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleStatusChange = async () => {
    if (!newStatus) return;
    setActing(true);
    try {
      await api.updateOrderStatus(id, newStatus);
      setStatusModal(false);
      load();
    } catch { alert("Failed to update status"); }
    setActing(false);
  };

  const handleRefund = async () => {
    setActing(true);
    try {
      await api.refundOrder(id, "Admin refund");
      setRefundModal(false);
      load();
    } catch { alert("Failed to refund"); }
    setActing(false);
  };

  if (loading) return <Spinner />;
  if (!order) return <p style={{ textAlign: "center", padding: "3rem 0", color: "var(--color-text-muted)" }}>Order not found.</p>;

  const o = order;

  return (
    <div>
      <Link href="/dashboard/seller/orders" className={styles.backLink}>
        <ArrowLeft size={14} />
        Back to Orders
      </Link>

      <PageHeader title="Order" italic={o.id?.slice(0, 8)} />

      <div className={styles.cardGrid}>
        <Card padding="lg">
          <h3 className={styles.sectionTitle}>Status</h3>
          <Badge variant={statusVariant[o.status] || "default"} size="lg">{o.status}</Badge>
          <div className={styles.statusActions}>
            {allowedTransitions[o.status]?.length > 0 && (
              <Button size="sm" variant="secondary" onClick={() => setStatusModal(true)}>Change Status</Button>
            )}
            {canRefund(o.status) && (
              <Button size="sm" variant="ghost" onClick={() => setRefundModal(true)}>Refund & Cancel</Button>
            )}
          </div>
        </Card>

        <Card padding="lg">
          <h3 className={styles.sectionTitle}>Details</h3>
          <div className={styles.detailGrid}>
            <div className={styles.detailRow}><span className={styles.detailLabel}>Total</span><span className={styles.detailValue}>{formatCurrency(o.total)}</span></div>
            <div className={styles.detailRow}><span className={styles.detailLabel}>Seller</span><span style={{ fontFamily: "var(--font-serif)" }}>{o.sellerEmail || "—"}</span></div>
            <div className={styles.detailRow}><span className={styles.detailLabel}>Buyer</span><span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>{o.buyerId?.slice(0, 12) || "—"}</span></div>
            <div className={styles.detailRow}><span className={styles.detailLabel}>Created</span><span>{formatDate(o.createdAt)}</span></div>
            {o.purchaseId && <div className={styles.detailRow}><span className={styles.detailLabel}>Purchase</span><span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>{o.purchaseId.slice(0, 8)}</span></div>}
          </div>
        </Card>

        <Card padding="lg">
          <h3 className={styles.sectionTitle}>Timeline</h3>
          {timeline?.events?.length ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {timeline.events.map((e: any, i: number) => (
                <div key={i} className={styles.timelineEntry}>
                  <div className={styles.timelineDot}>
                    <div className={styles.timelineInnerDot} />
                  </div>
                  <div>
                    <Badge variant={statusVariant[e.status] || "default"} size="sm">{e.status}</Badge>
                    <p className={styles.timelineDetail}>{e.detail}</p>
                    <p className={styles.timelineDate}>{formatDate(e.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>No timeline available.</p>}
        </Card>
      </div>

      {o.items?.length > 0 && (
        <Card padding="lg">
          <h3 className={styles.sectionTitle} style={{ marginBottom: "1rem" }}>Items</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {o.items.map((item: any, i: number) => (
              <div key={i} className={styles.itemRow}>
                <div>
                  <span className={styles.itemName}>{item.productName}</span>
                  <span className={styles.itemQuantity}>x{item.quantity}</span>
                </div>
                <span className={styles.itemSubtotal}>{formatCurrency(item.subtotal)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Modal open={statusModal} onClose={() => setStatusModal(false)} title="Change Order Status" description={`Current: ${o.status}. Select a new status.`}
        actions={<>
          <button onClick={() => setStatusModal(false)} className={`${styles.modalBtn} ${styles.modalBtnSecondary}`}>Cancel</button>
          <button onClick={handleStatusChange} disabled={!newStatus || acting} className={`${styles.modalBtn} ${styles.modalBtnPrimary}`}>Confirm</button>
        </>}
      >
        <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className={styles.select}>
          <option value="">Select status...</option>
          {(allowedTransitions[o.status] || []).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </Modal>

      <Modal open={refundModal} onClose={() => setRefundModal(false)} title="Refund Order" description="This will cancel the order and restore stock. This action cannot be undone."
        actions={<>
          <button onClick={() => setRefundModal(false)} className={`${styles.modalBtn} ${styles.modalBtnSecondary}`}>Keep Order</button>
          <button onClick={handleRefund} disabled={acting} className={`${styles.modalBtn} ${styles.modalBtnWarning}`}>Confirm Refund</button>
        </>}
      />
    </div>
  );
}
