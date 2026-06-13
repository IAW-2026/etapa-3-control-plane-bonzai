"use client";

import { useEffect, useState } from "react";
import { HeartPulse, Database, Globe, Mail, Brain, Cloud } from "lucide-react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Spinner } from "@/components/ui/Spinner";

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
  if (error) return <p className="text-center py-12 text-[var(--color-text-muted)]">Could not fetch health status.</p>;

  const deps = data?.dependencies || {};

  return (
    <div>
      <PageHeader title="System" italic="Health" description="Dependency status for the Seller App." />
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-3 h-3 rounded-full ${data?.status === "ok" ? "bg-[var(--color-success)]" : "bg-[var(--color-warning)]"}`} />
          <span className="font-serif text-lg text-[var(--color-primary)]">{data?.status === "ok" ? "All systems operational" : "Degraded"}</span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(deps).map(([key, val]: [string, any]) => (
          <div key={key} className="border border-[var(--color-border)] bg-[var(--color-bg)] p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-[rgba(27,61,47,0.05)] flex items-center justify-center text-[var(--color-primary)] shrink-0">
              {iconMap[key] || <Globe size={18} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-serif text-base text-[var(--color-primary)] capitalize">{key}</span>
                <div className={`w-2 h-2 rounded-full ${val?.status === "ok" ? "bg-[var(--color-success)]" : "bg-[var(--color-warning)]"}`} />
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{val?.status === "ok" ? "Operational" : val?.error || val?.status || "Unknown"}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-[var(--color-text-muted)] mt-8">Last checked: {data?.timestamp ? new Date(data.timestamp).toLocaleString() : "—"}</p>
    </div>
  );
}
