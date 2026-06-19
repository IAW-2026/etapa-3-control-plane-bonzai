"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Wallet, TrendingUp, DollarSign, ArrowRightLeft } from "lucide-react";
import Link from "next/link";
import { fetchWalletDetail, adjustWalletBalance } from "@/services/payments-actions";
import { formatARS, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { StatCard } from "@/components/ui/StatCard/StatCard";
import { Card, CardHeader } from "@/components/ui/Card/Card";
import { Badge } from "@/components/ui/Badge/Badge";
import { Spinner } from "@/components/ui/Spinner/Spinner";
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

export default function WalletDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [adjustModal, setAdjustModal] = useState(false);
  const [adjType, setAdjType] = useState<"CREDIT" | "DEBIT">("CREDIT");
  const [adjAmount, setAdjAmount] = useState("");
  const [adjReason, setAdjReason] = useState("");
  const [acting, setActing] = useState(false);

  const load = () => {
    setLoading(true);
    fetchWalletDetail(userId)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [userId]);

  const handleAdjust = async () => {
    const amount = parseFloat(adjAmount);
    if (!amount || amount <= 0 || !adjReason) return;
    setActing(true);
    try {
      await adjustWalletBalance(userId, adjType, amount, adjReason);
      setAdjustModal(false);
      setAdjAmount("");
      setAdjReason("");
      load();
    } catch (e: any) {
      alert(e.message || "Failed to adjust balance");
    }
    setActing(false);
  };

  if (loading) return <Spinner />;
  if (!data) return <p style={{ textAlign: "center", padding: "3rem 0", color: "var(--color-text-muted)" }}>Wallet not found.</p>;

  const w = data.wallet || {};
  const stats = data.stats || {};

  return (
    <div>
      <Link href="/dashboard/payments/wallets" className={styles.backLink}>
        <ArrowLeft size={14} />
        Back to Wallets
      </Link>

      <PageHeader
        title="Wallet"
        italic={userId?.slice(0, 12)}
        action={<Button size="sm" variant="secondary" onClick={() => setAdjustModal(true)}>Adjust Balance</Button>}
      />

      <div className={styles.statGrid}>
        <StatCard icon={<Wallet size={16} />} value={formatARS(w.availableBalance ?? 0)} label="Available" />
        <StatCard icon={<DollarSign size={16} />} value={formatARS(w.heldBalance ?? 0)} label="Held" warning={w.heldBalance > 0} />
        <StatCard icon={<TrendingUp size={16} />} value={formatARS(w.totalBalance ?? 0)} label="Total Balance" />
        <StatCard icon={<ArrowRightLeft size={16} />} value={stats.totalTransactions ?? "—"} label="Transactions" />
      </div>

      <div className={styles.statGrid}>
        <StatCard icon={<DollarSign size={16} />} value={formatARS(stats.totalVolume ?? 0)} label="Total Volume" />
        <StatCard icon={<TrendingUp size={16} />} value={formatARS(stats.totalNetEarnings ?? 0)} label="Net Earnings" />
        <StatCard icon={<DollarSign size={16} />} value={formatARS(stats.totalCommissionsPaid ?? 0)} label="Commissions Paid" />
      </div>

      <div className={styles.sectionGrid}>
        {/* Recent Transactions */}
        <Card padding="lg">
          <CardHeader title="Recent Transactions" />
          {data.recentTransactions?.length ? (
            data.recentTransactions.map((t: any) => (
              <div
                key={t.id}
                className={styles.txRow}
                onClick={() => router.push(`/dashboard/payments/transactions/${t.id}`)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Badge variant={statusVariant[t.status] || "default"} size="sm">{t.status}</Badge>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>{t.orderId || t.id?.slice(0, 8)}</span>
                </div>
                <span style={{ fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: "0.875rem" }}>{formatARS(t.netAmount)}</span>
              </div>
            ))
          ) : (
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>No recent transactions.</p>
          )}
        </Card>

        {/* Recent Ledger */}
        <Card padding="lg">
          <CardHeader title="Recent Ledger Entries" />
          {data.recentLedger?.length ? (
            data.recentLedger.map((entry: any) => (
              <div key={entry.id} className={styles.entryRow}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Badge variant={entry.type === "CREDIT" ? "success" : "warning"} size="sm">{entry.type}</Badge>
                  <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", maxWidth: "14rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.description}</span>
                </div>
                <span style={{ fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: "0.875rem" }}>{formatARS(entry.amount)}</span>
              </div>
            ))
          ) : (
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>No ledger entries.</p>
          )}
        </Card>
      </div>

      {/* Adjust Balance Modal */}
      <Modal
        open={adjustModal}
        onClose={() => setAdjustModal(false)}
        title="Adjust Wallet Balance"
        description={`Manually credit or debit funds for ${userId?.slice(0, 16)}. Creates double-entry ledger records.`}
        actions={<>
          <button onClick={() => setAdjustModal(false)} className={`${styles.modalBtn} ${styles.modalBtnSecondary}`}>Cancel</button>
          <button onClick={handleAdjust} disabled={!adjAmount || !adjReason || acting} className={`${styles.modalBtn} ${styles.modalBtnPrimary}`}>Confirm</button>
        </>}
      >
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Type</label>
          <select value={adjType} onChange={(e) => setAdjType(e.target.value as "CREDIT" | "DEBIT")} className={styles.select}>
            <option value="CREDIT">Credit (Add funds)</option>
            <option value="DEBIT">Debit (Remove funds)</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Amount (ARS)</label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={adjAmount}
            onChange={(e) => setAdjAmount(e.target.value)}
            placeholder="0.00"
            className={styles.inputField}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Reason</label>
          <textarea
            value={adjReason}
            onChange={(e) => setAdjReason(e.target.value)}
            placeholder="Reason for adjustment (required for audit)..."
            className={styles.textarea}
          />
        </div>
      </Modal>
    </div>
  );
}
