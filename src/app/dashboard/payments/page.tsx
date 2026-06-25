"use client";

import { useEffect, useState } from "react";
import { HeartPulse, ShieldCheck, Database, Activity, CheckCircle, XCircle } from "lucide-react";
import { fetchPaymentsHealth, fetchAuditIntegrity } from "@/services/payments-actions";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { StatCard } from "@/components/ui/StatCard/StatCard";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import { Card, CardHeader } from "@/components/ui/Card/Card";
import { Badge } from "@/components/ui/Badge/Badge";
import styles from "./page.module.css";

export default function PaymentsDashboard() {
  const [health, setHealth] = useState<any>(null);
  const [audit, setAudit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([
      fetchPaymentsHealth().catch(() => null),
      fetchAuditIntegrity().catch(() => null),
    ])
      .then(([h, a]) => {
        setHealth(h);
        setAudit(a);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error && !health && !audit) {
    return (
      <div className={styles.errorState}>
        <p className={styles.errorTitle}>Could not load Payments data</p>
        <p className={styles.errorHint}>Make sure the Payments App is running and PAYMENTS_API_URL / PAYMENTS_API_KEY are set correctly.</p>
      </div>
    );
  }

  const isHealthy = health?.status === "healthy";
  const auditPass = audit?.status === "PASS";
  const dbLatency = health?.services?.database?.latencyMs;

  return (
    <div>
      <PageHeader title="Payments" italic="App" description="Payment processing, escrow, disputes and wallet management." />

      <div className={styles.statGrid}>
        <StatCard
          icon={<HeartPulse size={16} />}
          value={health ? (isHealthy ? "Healthy" : "Degraded") : "—"}
          label="System Health"
          warning={health ? !isHealthy : false}
        />
        <StatCard
          icon={<Database size={16} />}
          value={dbLatency != null ? `${dbLatency}ms` : "—"}
          label="DB Latency"
        />
        <StatCard
          icon={<ShieldCheck size={16} />}
          value={audit ? (auditPass ? "PASS" : "FAIL") : "—"}
          label="Ledger Integrity"
          warning={audit ? !auditPass : false}
        />
        <StatCard
          icon={<Activity size={16} />}
          value={audit?.global?.debitEntryCount ?? "—"}
          label="Ledger Entries"
        />
      </div>

      <div className={styles.sectionGrid}>
        {health && (
          <Card padding="lg">
            <CardHeader title="Dependencies" description="External service status." />
            <div>
              {Object.entries(health.services || {}).map(([name, svc]: [string, any]) => (
                <div key={name} className={styles.serviceRow}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {svc.status === "up"
                      ? <CheckCircle size={14} style={{ color: "var(--color-primary)" }} />
                      : <XCircle size={14} style={{ color: "var(--color-warning)" }} />}
                    <span className={styles.serviceName}>{name}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <Badge variant={svc.status === "up" ? "success" : "error"} size="sm">
                      {svc.status === "up" ? "UP" : "DOWN"}
                    </Badge>
                    {svc.latencyMs != null && (
                      <span className={styles.serviceLatency}>{svc.latencyMs}ms</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {audit && (
          <Card padding="lg">
            <CardHeader title="Ledger Balance" description="Global debit vs credit check." />
            <div>
              <div className={styles.auditRow}>
                <span className={styles.auditLabel}>Total Debits</span>
                <span className={styles.auditValue}>${audit.global?.totalDebits?.toLocaleString("es-AR") ?? "—"}</span>
              </div>
              <div className={styles.auditRow}>
                <span className={styles.auditLabel}>Total Credits</span>
                <span className={styles.auditValue}>${audit.global?.totalCredits?.toLocaleString("es-AR") ?? "—"}</span>
              </div>
              <div className={styles.auditRow}>
                <span className={styles.auditLabel}>Difference</span>
                <span className={styles.auditValue}>${audit.global?.difference?.toLocaleString("es-AR") ?? "—"}</span>
              </div>
              <div className={styles.auditRow}>
                <span className={styles.auditLabel}>Balanced</span>
                <Badge variant={audit.global?.balanced ? "success" : "error"} size="sm">
                  {audit.global?.balanced ? "YES" : "NO"}
                </Badge>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
