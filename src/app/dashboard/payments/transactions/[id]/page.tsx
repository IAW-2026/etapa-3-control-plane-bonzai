"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { fetchTransactionDetail, forceTransactionStatus, releaseFunds } from "@/services/payments-actions";
import { formatARS, formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/Card/Card";
import { Badge } from "@/components/ui/Badge/Badge";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import Button from "@/components/ui/Button/Button";
import { Modal } from "@/components/ui/Modal/Modal";
import styles from "./page.module.css";

const statusVariant: Record<string, "default" | "primary" | "success" | "warning" | "error"> = {
  PENDING: "warning",
  HELD: "primary",
  DELIVERED: "success",
  COMPLETED: "success",
  DISPUTED: "error",
  REFUNDED: "default",
};

const ALL_STATUSES = ["PENDING", "HELD", "DELIVERED", "COMPLETED", "DISPUTED", "REFUNDED"];

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [tx, setTx] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [forceModal, setForceModal] = useState(false);
  const [releaseModal, setReleaseModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [reason, setReason] = useState("");
  const [acting, setActing] = useState(false);

  const load = () => {
    setLoading(true);
    fetchTransactionDetail(id)
      .then(setTx)
      .catch(() => setTx(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleForceStatus = async () => {
    if (!newStatus || !reason) return;
    setActing(true);
    try {
      await forceTransactionStatus(id, newStatus, reason);
      setForceModal(false);
      setNewStatus("");
      setReason("");
      load();
    } catch (e: any) {
      alert(e.message || "Failed to force status");
    }
    setActing(false);
  };

  const handleRelease = async () => {
    setActing(true);
    try {
      await releaseFunds(id);
      setReleaseModal(false);
      load();
    } catch (e: any) {
      alert(e.message || "Failed to release funds");
    }
    setActing(false);
  };

  if (loading) return <Spinner />;
  if (!tx) return <p style={{ textAlign: "center", padding: "3rem 0", color: "var(--color-text-muted)" }}>Transaction not found.</p>;

  return (
    <div>
      <Link href="/dashboard/payments/transactions" className={styles.backLink}>
        <ArrowLeft size={14} />
        Back to Transactions
      </Link>

      <PageHeader title="Transaction" italic={tx.id?.slice(0, 8)} />

      <div className={styles.cardGrid}>
        {/* Status card */}
        <Card padding="lg">
          <h3 className={styles.sectionTitle}>Status</h3>
          <Badge variant={statusVariant[tx.status] || "default"} size="lg">{tx.status}</Badge>
          <div className={styles.statusActions}>
            <Button size="sm" variant="secondary" onClick={() => setForceModal(true)}>Force Status</Button>
            {tx.status === "DELIVERED" && (
              <Button size="sm" variant="accent" onClick={() => setReleaseModal(true)}>Release Funds</Button>
            )}
          </div>
        </Card>

        {/* Details card */}
        <Card padding="lg">
          <h3 className={styles.sectionTitle}>Details</h3>
          <div className={styles.detailGrid}>
            <div className={styles.detailRow}><span className={styles.detailLabel}>Amount</span><span className={styles.detailValue}>{formatARS(tx.amount)}</span></div>
            <div className={styles.detailRow}><span className={styles.detailLabel}>Commission</span><span>{formatARS(tx.commissionAmount)} ({(tx.commissionRate * 100).toFixed(1)}%)</span></div>
            <div className={styles.detailRow}><span className={styles.detailLabel}>Net</span><span className={styles.detailValue}>{formatARS(tx.netAmount)}</span></div>
            <div className={styles.detailRow}><span className={styles.detailLabel}>Currency</span><span>{tx.currency}</span></div>
            <div className={styles.detailRow}><span className={styles.detailLabel}>Order</span><span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>{tx.orderId || "—"}</span></div>
            <div className={styles.detailRow}><span className={styles.detailLabel}>Buyer</span><span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>{tx.buyerId?.slice(0, 12) || "—"}</span></div>
            <div className={styles.detailRow}><span className={styles.detailLabel}>Seller</span><span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>{tx.sellerId?.slice(0, 12) || "—"}</span></div>
            <div className={styles.detailRow}><span className={styles.detailLabel}>Created</span><span>{formatDate(tx.createdAt)}</span></div>
          </div>
        </Card>

        {/* Dispute card */}
        <Card padding="lg">
          <h3 className={styles.sectionTitle}>Dispute</h3>
          {tx.dispute ? (
            <div className={styles.detailGrid}>
              <div className={styles.detailRow}><span className={styles.detailLabel}>Reason</span><Badge variant="error" size="sm">{tx.dispute.reason}</Badge></div>
              {tx.dispute.description && <div className={styles.detailRow}><span className={styles.detailLabel}>Description</span><span style={{ fontSize: "0.8125rem" }}>{tx.dispute.description}</span></div>}
              <div className={styles.detailRow}><span className={styles.detailLabel}>Resolution</span><span>{tx.dispute.resolution || "Pending"}</span></div>
              {tx.dispute.resolutionNotes && <div className={styles.detailRow}><span className={styles.detailLabel}>Notes</span><span style={{ fontSize: "0.8125rem" }}>{tx.dispute.resolutionNotes}</span></div>}
              {tx.dispute.refundAmount != null && <div className={styles.detailRow}><span className={styles.detailLabel}>Refund</span><span className={styles.detailValue}>{formatARS(tx.dispute.refundAmount)}</span></div>}
              <div className={styles.detailRow}><span className={styles.detailLabel}>Opened</span><span>{formatDate(tx.dispute.createdAt)}</span></div>
              {tx.dispute.resolvedAt && <div className={styles.detailRow}><span className={styles.detailLabel}>Resolved</span><span>{formatDate(tx.dispute.resolvedAt)}</span></div>}
            </div>
          ) : (
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>No dispute on this transaction.</p>
          )}
        </Card>
      </div>

      {/* Ledger Entries */}
      {tx.ledgerEntries?.length > 0 && (
        <Card padding="lg">
          <h3 className={styles.sectionTitle} style={{ marginBottom: "1rem" }}>Ledger Entries</h3>
          {tx.ledgerEntries.map((entry: any) => (
            <div key={entry.id} className={styles.ledgerRow}>
              <div>
                <Badge variant={entry.type === "CREDIT" ? "success" : "warning"} size="sm">{entry.type}</Badge>
                <span style={{ marginLeft: "0.75rem", fontSize: "0.8125rem" }}>{entry.description}</span>
              </div>
              <span style={{ fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: "0.875rem" }}>{formatARS(entry.amount)}</span>
            </div>
          ))}
        </Card>
      )}

      {/* Checkout Session info */}
      {tx.checkoutSession && (
        <Card padding="lg">
          <h3 className={styles.sectionTitle} style={{ marginBottom: "1rem" }}>Checkout Session</h3>
          <div className={styles.detailGrid} style={{ marginBottom: "1rem" }}>
            <div className={styles.detailRow}><span className={styles.detailLabel}>Session ID</span><span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>{tx.checkoutSession.id?.slice(0, 12)}</span></div>
            <div className={styles.detailRow}><span className={styles.detailLabel}>Total</span><span className={styles.detailValue}>{formatARS(tx.checkoutSession.totalAmount)}</span></div>
            <div className={styles.detailRow}><span className={styles.detailLabel}>Status</span><Badge variant="primary" size="sm">{tx.checkoutSession.status}</Badge></div>
          </div>
          {tx.checkoutSession.payments?.length > 0 && (
            <>
              <h3 className={styles.sectionTitle} style={{ marginBottom: "0.75rem" }}>Payments</h3>
              {tx.checkoutSession.payments.map((p: any) => (
                <div key={p.id} className={styles.paymentRow}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <Badge variant="primary" size="sm">{p.provider}</Badge>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{p.providerStatus}</span>
                  </div>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{p.externalId || "—"}</span>
                </div>
              ))}
            </>
          )}
        </Card>
      )}

      {/* Force Status Modal */}
      <Modal
        open={forceModal}
        onClose={() => setForceModal(false)}
        title="Force Transaction Status"
        description={`Current: ${tx.status}. This will create an audit entry in the ledger.`}
        actions={<>
          <button onClick={() => setForceModal(false)} className={`${styles.modalBtn} ${styles.modalBtnSecondary}`}>Cancel</button>
          <button onClick={handleForceStatus} disabled={!newStatus || !reason || acting} className={`${styles.modalBtn} ${styles.modalBtnPrimary}`}>Confirm</button>
        </>}
      >
        <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className={styles.select}>
          <option value="">Select status...</option>
          {ALL_STATUSES.filter((s) => s !== tx.status).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for this change (required for audit)..."
          className={styles.textarea}
        />
      </Modal>

      {/* Release Funds Modal */}
      <Modal
        open={releaseModal}
        onClose={() => setReleaseModal(false)}
        title="Release Funds"
        description={`This will move ${formatARS(tx.netAmount)} from held to available balance for seller ${tx.sellerId?.slice(0, 12)}. This action cannot be undone.`}
        actions={<>
          <button onClick={() => setReleaseModal(false)} className={`${styles.modalBtn} ${styles.modalBtnSecondary}`}>Cancel</button>
          <button onClick={handleRelease} disabled={acting} className={`${styles.modalBtn} ${styles.modalBtnWarning}`}>Release Funds</button>
        </>}
      />
    </div>
  );
}
