"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CreditCard, ShoppingCart, X } from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { StatCard } from "@/components/ui/StatCard/StatCard";
import { Table, TableRow } from "@/components/ui/Table/Table";
import { Pagination } from "@/components/ui/Pagination/Pagination";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { Badge } from "@/components/ui/Badge/Badge";
import styles from "./page.module.css";

const statusVariant: Record<string, "default" | "primary" | "success" | "warning" | "error"> = {
  PENDING: "warning",
  PAID: "primary",
  AWAITING_TRACKING: "warning",
  SHIPPED: "success",
  CANCELLED: "error",
};

const headers = [
  { label: "ID", width: "1.5fr" },
  { label: "Date", width: "1.5fr" },
  { label: "Orders", width: "1fr" },
  { label: "Items", width: "1fr" },
  { label: "Total", width: "1fr" },
];

export default function PurchasesPage() {
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1", 10);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPurchase, setSelectedPurchase] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    api.getPurchases(page)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div>
      <PageHeader title="Purchases" italic="" description="All purchases across the platform." />

      <div className={styles.statGrid}>
        <StatCard icon={<CreditCard size={16} />} value={data?.total ?? "—"} label="Total Purchases" />
      </div>

      {loading ? (
        <Spinner />
      ) : !data?.purchases?.length ? (
        <EmptyState title="No purchases yet" />
      ) : (
        <>
          <Table headers={headers}>
            {data.purchases.map((p: any) => (
              <TableRow
                key={p.id}
                onClick={() => setSelectedPurchase(p)}
                columns={[
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{p.id.slice(0, 8)}</span>,
                  <span style={{ fontSize: "0.875rem" }}>{formatDate(p.createdAt)}</span>,
                  <Badge variant="primary">{p.orders?.length || 0}</Badge>,
                  <span>{(p.orders || []).reduce((s: number, o: any) => s + (o.items?.length || 0), 0)}</span>,
                  <span style={{ fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: "0.875rem" }}>
                    {formatCurrency((p.orders || []).reduce((s: number, o: any) => s + o.total, 0))}
                  </span>,
                ]}
              />
            ))}
          </Table>
          <Pagination total={data.total} page={page} limit={10} />
        </>
      )}

      {selectedPurchase && (
        <PurchaseDetailModal
          purchase={selectedPurchase}
          onClose={() => setSelectedPurchase(null)}
        />
      )}
    </div>
  );
}

function PurchaseDetailModal({ purchase, onClose }: { purchase: any; onClose: () => void }) {
  const totalItems = (purchase.orders || []).reduce((s: number, o: any) => s + (o.items?.length || 0), 0);
  const totalAmount = (purchase.orders || []).reduce((s: number, o: any) => s + o.total, 0);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h3 className={styles.modalTitle}>
              Purchase <span className={styles.modalId}>{purchase.id.slice(0, 8)}</span>
            </h3>
            <p className={styles.modalDate}>{formatDate(purchase.createdAt)}</p>
          </div>
          <button onClick={onClose} className={styles.closeBtn}>
            <X size={16} />
          </button>
        </div>

        <div className={styles.modalSummary}>
          <div className={styles.summaryItem}>
            <ShoppingCart size={14} />
            <span>{purchase.orders?.length || 0} orders</span>
          </div>
          <div className={styles.summaryItem}>
            <span>{totalItems} items</span>
          </div>
          <div className={styles.summaryTotal}>
            <span>{formatCurrency(totalAmount)}</span>
          </div>
        </div>

        <div className={styles.ordersList}>
          {purchase.orders?.map((order: any, i: number) => (
            <div key={order.id || i} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <div className={styles.orderHeaderLeft}>
                  <span className={styles.orderId}>#{order.id?.slice(0, 8)}</span>
                  <Badge variant={statusVariant[order.status] || "default"} size="sm">{order.status}</Badge>
                </div>
                <span className={styles.orderTotal}>{formatCurrency(order.total)}</span>
              </div>
              <div className={styles.orderMeta}>
                <span className={styles.orderMetaItem}>Seller: {order.sellerEmail || "—"}</span>
                <span className={styles.orderMetaItem}>Buyer: <span className={styles.orderBuyerId}>{order.buyerId?.slice(0, 12) || "—"}</span></span>
              </div>
              {order.items?.length > 0 && (
                <div className={styles.orderItems}>
                  {order.items.map((item: any, j: number) => (
                    <div key={j} className={styles.orderItem}>
                      <span className={styles.orderItemName}>{item.productName}</span>
                      <span className={styles.orderItemMeta}>
                        x{item.quantity}
                        <span className={styles.orderItemSubtotal}>{formatCurrency(item.subtotal)}</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
