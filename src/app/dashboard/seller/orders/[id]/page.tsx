"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { PageHeader } from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

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
  if (!order) return <p className="text-center py-12 text-[var(--color-text-muted)]">Order not found.</p>;

  const o = order;

  return (
    <div>
      <Link href="/dashboard/seller/orders" className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.1em] text-[var(--color-text-muted)] no-underline hover:text-[var(--color-primary)] mb-4">
        <ArrowLeft size={14} />
        Back to Orders
      </Link>

      <PageHeader title="Order" italic={o.id?.slice(0, 8)} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card padding="lg" className="border border-[var(--color-border)] bg-[var(--color-bg)]">
          <h3 className="text-[0.6rem] uppercase tracking-[0.15em] text-[#aaa] font-semibold mb-3">Status</h3>
          <Badge variant={statusVariant[o.status] || "default"} size="lg">{o.status}</Badge>
          <div className="mt-6 flex flex-col gap-2">
            {allowedTransitions[o.status]?.length > 0 && (
              <Button size="sm" variant="secondary" onClick={() => setStatusModal(true)}>Change Status</Button>
            )}
            {canRefund(o.status) && (
              <Button size="sm" variant="ghost" onClick={() => setRefundModal(true)}>Refund & Cancel</Button>
            )}
          </div>
        </Card>

        <Card padding="lg" className="border border-[var(--color-border)] bg-[var(--color-bg)]">
          <h3 className="text-[0.6rem] uppercase tracking-[0.15em] text-[#aaa] font-semibold mb-3">Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Total</span><span className="font-serif font-medium">{formatCurrency(o.total)}</span></div>
            <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Seller</span><span className="font-serif">{o.sellerEmail || "—"}</span></div>
            <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Buyer</span><span className="font-mono text-xs">{o.buyerId?.slice(0, 12) || "—"}</span></div>
            <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Created</span><span>{formatDate(o.createdAt)}</span></div>
            {o.purchaseId && <div className="flex justify-between"><span className="text-[var(--color-text-muted)]">Purchase</span><span className="font-mono text-xs">{o.purchaseId.slice(0, 8)}</span></div>}
          </div>
        </Card>

        <Card padding="lg" className="border border-[var(--color-border)] bg-[var(--color-bg)]">
          <h3 className="text-[0.6rem] uppercase tracking-[0.15em] text-[#aaa] font-semibold mb-3">Timeline</h3>
          {timeline?.events?.length ? (
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
          ) : <p className="text-xs text-[var(--color-text-muted)]">No timeline available.</p>}
        </Card>
      </div>

      {o.items?.length > 0 && (
        <Card padding="lg" className="border border-[var(--color-border)] bg-[var(--color-bg)]">
          <h3 className="text-[0.6rem] uppercase tracking-[0.15em] text-[#aaa] font-semibold mb-4">Items</h3>
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
        </Card>
      )}

      <Modal open={statusModal} onClose={() => setStatusModal(false)} title="Change Order Status" description={`Current: ${o.status}. Select a new status.`}
        actions={<>
          <button onClick={() => setStatusModal(false)} className="text-[0.65rem] uppercase tracking-[0.1em] font-semibold px-4 py-2 border border-[var(--color-border)] bg-transparent text-[var(--color-text-muted)] cursor-pointer">Cancel</button>
          <button onClick={handleStatusChange} disabled={!newStatus || acting} className="text-[0.65rem] uppercase tracking-[0.1em] font-semibold px-4 py-2 border-none bg-[var(--color-primary)] text-white cursor-pointer disabled:opacity-40">Confirm</button>
        </>}
      >
        <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="w-full px-3 py-2 border-[1.5px] border-[var(--color-border)] rounded-xl text-sm">
          <option value="">Select status...</option>
          {(allowedTransitions[o.status] || []).map((s) => (
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
    </div>
  );
}
