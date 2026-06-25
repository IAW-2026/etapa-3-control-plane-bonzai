"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { fetchPaymentsHealth } from "@/services/payments-actions";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { Card } from "@/components/ui/Card/Card";
import { Badge } from "@/components/ui/Badge/Badge";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import styles from "./page.module.css";

export default function HealthPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchPaymentsHealth()
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error || !data) {
    return (
      <div className={styles.errorState}>
        <p className={styles.errorTitle}>Could not check health</p>
        <p className={styles.errorHint}>Make sure the Payments App is running and env vars are configured.</p>
      </div>
    );
  }

  const isHealthy = data.status === "healthy";

  return (
    <div>
      <PageHeader title="Health" italic="Check" description="Payments App dependency status and latency." />

      <div className={`${styles.statusBanner} ${isHealthy ? styles.statusHealthy : styles.statusDegraded}`}>
        <span className={styles.statusIcon}>{isHealthy ? "✅" : "⚠️"}</span>
        <div>
          <p className={styles.statusText}>{isHealthy ? "All Systems Operational" : "System Degraded"}</p>
          <p className={styles.statusSub}>Environment: {data.environment || "unknown"} • {data.timestamp ? new Date(data.timestamp).toLocaleString("es-AR") : ""}</p>
        </div>
      </div>

      <div className={styles.serviceGrid}>
        {Object.entries(data.services || {}).map(([name, svc]: [string, any]) => (
          <Card key={name} padding="lg" className={styles.serviceCard}>
            <div className={styles.serviceHeader}>
              {svc.status === "up"
                ? <CheckCircle size={18} style={{ color: "var(--color-primary)" }} />
                : <XCircle size={18} style={{ color: "var(--color-warning)" }} />}
              <span className={styles.serviceName}>{name}</span>
            </div>
            <Badge variant={svc.status === "up" ? "success" : "error"} size="lg">
              {svc.status === "up" ? "OPERATIONAL" : "DOWN"}
            </Badge>
            {svc.latencyMs != null && (
              <p className={styles.serviceDetail}>Latency: {svc.latencyMs}ms</p>
            )}
            {svc.error && (
              <p className={styles.serviceDetail} style={{ color: "var(--color-warning)" }}>{svc.error}</p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
