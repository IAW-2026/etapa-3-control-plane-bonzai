"use client";

import { useEffect, useState } from "react";
import { HeartPulse, Database, Globe, Mail, Brain, Cloud } from "lucide-react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import styles from "./page.module.css";

const iconMap: Record<string, React.ReactNode> = {
  database: <Database size={18} />,
  clerk: <Globe size={18} />,
  resend: <Mail size={18} />,
  gemini: <Brain size={18} />,
  cloudinary: <Cloud size={18} />,
};

export default function HealthPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => { api.getHealth().then(setData).catch(() => setError(true)).finally(() => setLoading(false)); }, []);

  if (loading) return <Spinner />;
  if (error) return <p className={styles.errorState}>Could not fetch health status.</p>;

  const deps = data?.dependencies || {};

  return (
    <div>
      <PageHeader title="System" italic="Health" description="Dependency status for the Seller App." />
      <div className={styles.statusRow}>
        <div className={`${styles.statusDot} ${data?.status === "ok" ? styles.statusDotOk : styles.statusDotWarning}`} />
        <span className={styles.statusText}>{data?.status === "ok" ? "All systems operational" : "Degraded"}</span>
      </div>
      <div className={styles.depGrid}>
        {Object.entries(deps).map(([key, val]: [string, any]) => (
          <div key={key} className={styles.depCard}>
            <div className={styles.depIcon}>
              {iconMap[key] || <Globe size={18} />}
            </div>
            <div className={styles.depInfo}>
              <div className={styles.depNameRow}>
                <span className={styles.depName}>{key}</span>
                <div className={`${styles.depStatusDot} ${val?.status === "ok" ? styles.depStatusDotOk : styles.depStatusDotWarning}`} />
              </div>
              <p className={styles.depStatus}>{val?.status === "ok" ? "Operational" : val?.error || val?.status || "Unknown"}</p>
            </div>
          </div>
        ))}
      </div>
      <p className={styles.timestamp}>Last checked: {data?.timestamp ? new Date(data.timestamp).toLocaleString() : "—"}</p>
    </div>
  );
}
