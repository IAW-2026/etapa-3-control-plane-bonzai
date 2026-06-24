"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge/Badge";
import { Modal } from "@/components/ui/Modal/Modal";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import Button from "@/components/ui/Button/Button";
import styles from "./OrderDetailModal.module.css";

const statusVariant: Record<string, "default" | "primary" | "success" | "warning" | "error"> = {
  PENDING: "warning",
  PAID: "primary",
  AWAITING_TRACKING: "warning",
  SHIPPED: "success",
  CANCELLED: "error",
};

const canCancel = (status: string) => status === "PENDING";

interface OrderDetailModalProps {
  orderId: string;
  open: boolean;
  onClose: () => void;
}

export function OrderDetailModal({ orderId, open, onClose }: OrderDetailModalProps) {
  const [order, setOrder] = useState<any>(null);
  const [timeline, setTimeline] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState(false);
  const [acting, setActing] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.getOrder(orderId),
      api.getOrderTimeline(orderId),
    ])
      .then(([o, t]) => { setOrder(o.order || o); setTimeline(t); })
      .catch(() => { setOrder(null); setTimeline(null); })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (open) load();
  }, [orderId, open]);

  const handleCancel = async () => {
    setActing(true);
    try {
      await api.refundOrder(orderId, "Cancelled by admin");
      setCancelModal(false);
      load();
    } catch { alert("Failed to cancel order"); }
    setActing(false);
  };

  const o = order;

  return (
    <Modal open={open} onClose={onClose}>
      {loading ? (
        <Spinner />
      ) : !o ? (
        <p className={styles.notFound}>Order not found.</p>
      ) : (
        <div className={styles.content}>
          <div className={styles.header}>
            <div>
              <h3 className={styles.orderId}>
                Order <span className={styles.orderShortId}>{o.id?.slice(0, 8)}</span>
              </h3>
              <p className={styles.orderDate}>{formatDate(o.createdAt)}</p>
            </div>
            <Badge variant={statusVariant[o.status] || "default"} size="lg">{o.status}</Badge>
          </div>

          <div className={styles.infoGrid}>
            <div className={styles.infoRow}><span className={styles.infoLabel}>Total</span><span className={styles.infoValue}>{formatCurrency(o.total)}</span></div>
            <div className={styles.infoRow}><span className={styles.infoLabel}>Seller</span><span className={styles.infoValue}>{o.sellerEmail || "—"}</span></div>
            <div className={styles.infoRow}><span className={styles.infoLabel}>Buyer</span><span className={styles.infoMono}>{o.buyerId?.slice(0, 12) || "—"}</span></div>
            {o.purchaseId && <div className={styles.infoRow}><span className={styles.infoLabel}>Purchase</span><span className={styles.infoMono}>{o.purchaseId.slice(0, 8)}</span></div>}
          </div>

          <div className={styles.actionRow}>
            {canCancel(o.status) && (
              <Button size="sm" variant="ghost" onClick={() => setCancelModal(true)}>Cancel Order</Button>
            )}
          </div>

          {timeline?.events?.length > 0 && (
            <div>
              <h4 className={styles.sectionTitle}>Timeline</h4>
              <div className={styles.timelineList}>
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
            </div>
          )}

          {o.items?.length > 0 && (
            <div>
              <h4 className={styles.sectionTitle}>Items</h4>
              <div className={styles.itemsList}>
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
            </div>
          )}
        </div>
      )}

      <Modal open={cancelModal} onClose={() => setCancelModal(false)} title="Cancel Order" description="This will cancel the order and restore stock. This action cannot be undone."
        actions={<>
          <button onClick={() => setCancelModal(false)} className={`${styles.modalBtn} ${styles.modalBtnSecondary}`}>Keep Order</button>
          <button onClick={handleCancel} disabled={acting} className={`${styles.modalBtn} ${styles.modalBtnWarning}`}>Confirm Cancel</button>
        </>}
      />
    </Modal>
  );
}
