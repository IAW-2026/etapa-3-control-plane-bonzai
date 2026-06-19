"use client";

import { useEffect, useState } from "react";
import { fetchAuditIntegrity } from "@/services/payments-actions";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card/Card";
import { Badge } from "@/components/ui/Badge/Badge";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import styles from "./page.module.css";

export default function AuditPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchAuditIntegrity()
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error || !data) {
    return (
      <div className={styles.errorState}>
        <p className={styles.errorTitle}>Could not load audit data</p>
        <p className={styles.errorHint}>Make sure the Payments App is running and env vars are configured.</p>
      </div>
    );
  }

  const pass = data.status === "PASS";

  return (
    <div>
      <PageHeader title="Ledger" italic="Audit" description="Double-entry accounting integrity verification." />

      <div className={`${styles.statusBanner} ${pass ? styles.statusPass : styles.statusFail}`}>
        <span className={styles.statusIcon}>{pass ? "✅" : "❌"}</span>
        <div>
          <p className={styles.statusText}>{pass ? "All Checks Passed" : "Integrity Issues Detected"}</p>
          <p className={styles.statusSub}>{data.timestamp ? new Date(data.timestamp).toLocaleString("es-AR") : ""}</p>
        </div>
      </div>

      <div className={styles.sectionGrid}>
        {/* Global Balance */}
        <Card padding="lg">
          <CardHeader title="Global Balance" description="Σ(DEBIT) vs Σ(CREDIT) across entire ledger." />
          <div className={styles.auditRow}>
            <span className={styles.auditLabel}>Total Debits</span>
            <span className={styles.auditValue}>${data.global?.totalDebits?.toLocaleString("es-AR") ?? "—"}</span>
          </div>
          <div className={styles.auditRow}>
            <span className={styles.auditLabel}>Total Credits</span>
            <span className={styles.auditValue}>${data.global?.totalCredits?.toLocaleString("es-AR") ?? "—"}</span>
          </div>
          <div className={styles.auditRow}>
            <span className={styles.auditLabel}>Difference</span>
            <span className={styles.auditValue}>${data.global?.difference?.toLocaleString("es-AR") ?? "—"}</span>
          </div>
          <div className={styles.auditRow}>
            <span className={styles.auditLabel}>Balanced</span>
            <Badge variant={data.global?.balanced ? "success" : "error"} size="sm">
              {data.global?.balanced ? "YES" : "NO"}
            </Badge>
          </div>
          <div className={styles.auditRow}>
            <span className={styles.auditLabel}>Debit Entries</span>
            <span className={styles.auditValue}>{data.global?.debitEntryCount ?? "—"}</span>
          </div>
          <div className={styles.auditRow}>
            <span className={styles.auditLabel}>Credit Entries</span>
            <span className={styles.auditValue}>{data.global?.creditEntryCount ?? "—"}</span>
          </div>
        </Card>

        {/* Transaction Integrity */}
        <Card padding="lg">
          <CardHeader title="Transaction Integrity" description="Per-transaction DEBIT = CREDIT check." />
          <div className={styles.auditRow}>
            <span className={styles.auditLabel}>Total Checked</span>
            <span className={styles.auditValue}>{data.transactionIntegrity?.totalChecked ?? "—"}</span>
          </div>
          <div className={styles.auditRow}>
            <span className={styles.auditLabel}>Inconsistencies</span>
            <Badge variant={data.transactionIntegrity?.inconsistentCount === 0 ? "success" : "error"} size="sm">
              {`${data.transactionIntegrity?.inconsistentCount ?? "—"}`}
            </Badge>
          </div>
          {data.transactionIntegrity?.inconsistencies?.length > 0 && (
            <div style={{ marginTop: "0.75rem" }}>
              {data.transactionIntegrity.inconsistencies.map((inc: any, i: number) => (
                <div key={i} className={styles.inconsistencyRow}>
                  TX {inc.transactionId?.slice(0, 8)} — Debit: ${inc.totalDebit} / Credit: ${inc.totalCredit}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Orphaned Transactions */}
        <Card padding="lg">
          <CardHeader title="Orphaned Transactions" description="Processed transactions without ledger entries." />
          <div className={styles.auditRow}>
            <span className={styles.auditLabel}>Count</span>
            <Badge variant={data.orphanedTransactions?.count === 0 ? "success" : "error"} size="sm">
              {`${data.orphanedTransactions?.count ?? "—"}`}
            </Badge>
          </div>
          <div className={styles.auditRow}>
            <span className={styles.auditLabel}>Message</span>
            <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", textAlign: "right", maxWidth: "14rem" }}>{data.orphanedTransactions?.message || "—"}</span>
          </div>
        </Card>

        {/* Wallet Integrity */}
        <Card padding="lg">
          <CardHeader title="Wallet Integrity" description="Wallet balances vs ledger net calculation." />
          <div className={styles.auditRow}>
            <span className={styles.auditLabel}>Wallets Checked</span>
            <span className={styles.auditValue}>{data.walletIntegrity?.totalChecked ?? "—"}</span>
          </div>
          <div className={styles.auditRow}>
            <span className={styles.auditLabel}>Inconsistencies</span>
            <Badge variant={data.walletIntegrity?.inconsistentCount === 0 ? "success" : "error"} size="sm">
              {`${data.walletIntegrity?.inconsistentCount ?? "—"}`}
            </Badge>
          </div>
          {data.walletIntegrity?.inconsistencies?.length > 0 && (
            <div style={{ marginTop: "0.75rem" }}>
              {data.walletIntegrity.inconsistencies.map((inc: any, i: number) => (
                <div key={i} className={styles.inconsistencyRow}>
                  Wallet {inc.userId?.slice(0, 12)} — Balance: ${inc.walletBalance} / Ledger: ${inc.ledgerNet}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
