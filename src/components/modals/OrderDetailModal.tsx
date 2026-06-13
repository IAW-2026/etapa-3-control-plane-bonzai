"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";

const statusVariant: Record<string, "default" | "primary" | "success" | "warning" | "error"> = {
  PENDING: "warning",
  PAID: "primary",
  AWAITING_TRACKING: "warning",
  SHIPPED: "success",
  CANCELLED: "error",
};

const allowedTransitions: Record<string, string[]> = {
  PENDING: ["PAID", "CANCELLED"],
  PAID: ["AWAITING_TRACKING"],
  AWAITING_TRACKING: ["SHIPPED"],
  SHIPPED: [],
  CANCELLED: [],
};

const canRefund = (status: string) => status === "PENDING" || status === "PAID";

interface OrderDetailModalProps {
  orderId: string;
  open: boolean;
  onClose: () => void;
}

export function OrderDetailModal({ orderId, open, onClose }: OrderDetailModalProps) {
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

  const handleStatusChange = async () => {
    if (!newStatus) return;
    setActing(true);
    try {
      await api.updateOrderStatus(orderId, newStatus);
      setStatusModal(false);
      load();
    } catch { alert("Failed to update status"); }
    setActing(false);
  };

  const handleRefund = async () => {
    setActing(true);
    try {
      await api.refundOrder(orderId, "Admin refund");
      setRefundModal(false);
      load();
    } catch { alert("Failed to refund"); }
    setActing(false);
  };

  const o = order;

  return (
    <Modal open={open} onClose={onClose} className="max-w-2xl">
      {loading ? (
        <Spinner />
      ) : !o ? (
        <p className="text-sm text-[var(--color-text-muted)]">Order not found.</p>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-xl text-[var(--color-primary)]">
                Order <span className="font-mono text-sm">{o.id?.slice(0, 8)}</span>
              </h3>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">{formatDate(o.createdAt)}</p>
            </div>
            <Badge variant={statusVariant[o.status] || "default"} size="lg">{o.status}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Total</span><span className="font-serif font-medium">{formatCurrency(o.total)}</span></div>
            <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Seller</span><span className="font-serif">{o.sellerEmail || "—"}</span></div>
            <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Buyer</span><span className="font-mono text-xs">{o.buyerId?.slice(0, 12) || "—"}</span></div>
            {o.purchaseId && <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Purchase</span><span className="font-mono text-xs">{o.purchaseId.slice(0, 8)}</span></div>}
          </div>

          <div className="flex gap-2">
            {allowedTransitions[o.status]?.length > 0 && (
              <Button size="sm" variant="secondary" onClick={() => { setNewStatus(""); setStatusModal(true); }}>Change Status</Button>
            )}
            {canRefund(o.status) && (
              <Button size="sm" variant="ghost" onClick={() => setRefundModal(true)}>Refund & Cancel</Button>
            )}
          </div>

          {timeline?.events?.length > 0 && (
            <div>
              <h4 className="text-[0.6rem] uppercase tracking-[0.15em] text-[#aaa] font-semibold mb-3">Timeline</h4>
              <div className="space-y-3">
                {timeline.events.map((e: any, i: number) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-[var(--color-primary)] flex items-center justify-center mt-0.5 shrink-0">
                      <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
                    </div>
                    <div>
                      <Badge variant={statusVariant[e.status] || "default"} size="sm">{e.status}</Badge>
                      <p className="text-xs text-[var(--color-text-muted)] mt-1">{e.detail}</p>
                      <p className="text-[0.6rem] text-[#aaa]">{formatDate(e.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {o.items?.length > 0 && (
            <div>
              <h4 className="text-[0.6rem] uppercase tracking-[0.15em] text-[#aaa] font-semibold mb-3">Items</h4>
              <div className="space-y-2">
                {o.items.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-[var(--color-border)] last:border-b-0">
                    <div>
                      <span className="font-serif text-sm font-medium">{item.productName}</span>
                      <span className="text-xs text-[var(--color-text-muted)] ml-2">x{item.quantity}</span>
                    </div>
                    <span className="font-serif text-sm">{formatCurrency(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Modal open={statusModal} onClose={() => setStatusModal(false)} title="Change Order Status" description={`Current: ${o?.status}. Select a new status.`}
        actions={<>
          <button onClick={() => setStatusModal(false)} className="text-[0.65rem] uppercase tracking-[0.1em] font-semibold px-4 py-2 border border-[var(--color-border)] bg-transparent text-[var(--color-text-muted)] cursor-pointer">Cancel</button>
          <button onClick={handleStatusChange} disabled={!newStatus || acting} className="text-[0.65rem] uppercase tracking-[0.1em] font-semibold px-4 py-2 border-none bg-[var(--color-primary)] text-white cursor-pointer disabled:opacity-40">Confirm</button>
        </>}
      >
        <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="w-full px-3 py-2 border-[1.5px] border-[var(--color-border)] rounded-xl text-sm">
          <option value="">Select status...</option>
          {(allowedTransitions[o?.status] || []).map((s: string) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </Modal>

      <Modal open={refundModal} onClose={() => setRefundModal(false)} title="Refund Order" description="This will cancel the order and restore stock. This action cannot be undone."
        actions={<>
          <button onClick={() => setRefundModal(false)} className="text-[0.65rem] uppercase tracking-[0.1em] font-semibold px-4 py-2 border border-[var(--color-border)] bg-transparent text-[var(--color-text-muted)] cursor-pointer">Keep Order</button>
          <button onClick={handleRefund} disabled={acting} className="text-[0.65rem] uppercase tracking-[0.1em] font-semibold px-4 py-2 border-none bg-[var(--color-warning)] text-white cursor-pointer disabled:opacity-40">Confirm Refund</button>
        </>}
      />
    </Modal>
  );
}
