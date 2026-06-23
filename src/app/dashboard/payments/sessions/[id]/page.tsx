"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { fetchCheckoutSessionDetail } from "@/services/payments-actions";
import { formatARS, formatDate } from "@/lib/utils";
import { Card, CardHeader } from "@/components/ui/Card/Card";
import { Badge } from "@/components/ui/Badge/Badge";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import styles from "./page.module.css";

const statusVariant: Record<string, "default" | "primary" | "success" | "warning" | "error"> = {
  PENDING: "warning",
  HELD: "primary",
  DELIVERED: "success",
  COMPLETED: "success",
  DISPUTED: "error",
  REFUNDED: "default",
  PAID: "primary",
  EXPIRED: "error",
};

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchCheckoutSessionDetail(id)
      .then(setSession)
      .catch(() => setSession(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner />;
  if (!session) return <p style={{ textAlign: "center", padding: "3rem 0", color: "var(--color-text-muted)" }}>Session not found.</p>;

  const summary = session.summary || {};

  return (
    <div>
      <Link href="/dashboard/payments/sessions" className={styles.backLink}>
        <ArrowLeft size={14} />
        Back to Sessions
      </Link>

      <PageHeader title="Session" italic={session.id?.slice(0, 8)} />

      <div className={styles.cardGrid}>
        {/* Info card */}
        <Card padding="lg">
          <h3 className={styles.sectionTitle}>Session Info</h3>
          <div className={styles.detailGrid}>
            <div className={styles.detailRow}><span className={styles.detailLabel}>Buyer</span><span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>{session.buyerId?.slice(0, 14) || "—"}</span></div>
            <div className={styles.detailRow}><span className={styles.detailLabel}>Total</span><span className={styles.detailValue}>{formatARS(session.totalAmount)}</span></div>
            <div className={styles.detailRow}><span className={styles.detailLabel}>Status</span><Badge variant={statusVariant[session.status] || "default"} size="sm">{session.status}</Badge></div>
            <div className={styles.detailRow}><span className={styles.detailLabel}>Created</span><span>{formatDate(session.createdAt)}</span></div>
            <div className={styles.detailRow}><span className={styles.detailLabel}>Updated</span><span>{formatDate(session.updatedAt)}</span></div>
          </div>
        </Card>

        {/* Summary card */}
        <Card padding="lg">
          <h3 className={styles.sectionTitle}>Summary</h3>
          <div className={styles.summaryRow}><span className={styles.summaryLabel}>Transactions</span><span className={styles.summaryValue}>{summary.transactionCount ?? "—"}</span></div>
          <div className={styles.summaryRow}><span className={styles.summaryLabel}>Unique Sellers</span><span className={styles.summaryValue}>{summary.uniqueSellers ?? "—"}</span></div>
          <div className={styles.summaryRow}><span className={styles.summaryLabel}>Total Commissions</span><span className={styles.summaryValue}>{formatARS(summary.totalCommissions ?? 0)}</span></div>
          <div className={styles.summaryRow}><span className={styles.summaryLabel}>Total Net</span><span className={styles.summaryValue}>{formatARS(summary.totalNet ?? 0)}</span></div>
          {summary.statusBreakdown && (
            <div>
              <h3 className={styles.sectionTitle} style={{ marginTop: "1rem" }}>Status Breakdown</h3>
              <div className={styles.breakdownRow}>
                {Object.entries(summary.statusBreakdown).map(([st, count]: [string, any]) => (
                  <Badge key={st} variant={statusVariant[st] || "default"} size="sm">{`${st}: ${count}`}</Badge>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Payments card */}
        <Card padding="lg">
          <h3 className={styles.sectionTitle}>Payments</h3>
          {session.payments?.length ? (
            session.payments.map((p: any) => (
              <div key={p.id} className={styles.paymentRow}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Badge variant="primary" size="sm">{p.provider}</Badge>
                  <Badge variant={p.providerStatus === "approved" ? "success" : "warning"} size="sm">{p.providerStatus}</Badge>
                </div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{p.externalId || "—"}</span>
              </div>
            ))
          ) : (
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>No payments recorded.</p>
          )}
        </Card>
      </div>

      {/* Transactions table */}
      {session.transactions?.length > 0 && (
        <Card padding="lg">
          <CardHeader title="Transactions" description={`${session.transactions.length} transaction(s) in this session.`} />
          {session.transactions.map((t: any) => (
            <div
              key={t.id}
              className={styles.txRow}
              onClick={() => router.push(`/dashboard/payments/transactions/${t.id}`)}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <Badge variant={statusVariant[t.status] || "default"} size="sm">{t.status}</Badge>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>{t.orderId || t.id?.slice(0, 8)}</span>
                <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{t.sellerId?.slice(0, 10)}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{formatARS(t.commissionAmount ?? 0)} comm.</span>
                <span style={{ fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: "0.875rem" }}>{formatARS(t.amount)}</span>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
