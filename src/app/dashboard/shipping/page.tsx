"use client";

import { useEffect, useState } from "react";
import { Truck, Users, Package, AlertTriangle, TrendingUp, CheckCircle } from "lucide-react";
import { fetchDeliveryStats, fetchDrivers, fetchOperators } from "@/services/shipping-actions";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { StatCard } from "@/components/ui/StatCard/StatCard";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import styles from "./page.module.css";

export default function ShippingDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetchDeliveryStats(),
      fetchDrivers(1, 1),
      fetchOperators(1, 1),
    ])
      .then(([stats, driversResult, operatorsResult]) => {
        const inner = stats?.data ?? stats?.stats ?? stats?.summary ?? stats ?? {};
        const driversCount = driversResult?.meta?.total_records ?? driversResult?.total_records ?? null;
        const operatorsCount = operatorsResult?.meta?.total_records ?? operatorsResult?.total_records ?? null;
        setData({ inner, driversCount, operatorsCount });
      })
      .catch((e: Error) => setError(e.message || "Unknown error"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error) {
    return (
      <div className={styles.errorState}>
        <p className={styles.errorTitle}>Could not load shipping data</p>
        <p className={styles.errorHint}>{error}</p>
      </div>
    );
  }

  const inner = data?.inner ?? {};
  const s = (key: string) => {
    const camel = key;
    const snake = key.replace(/[A-Z]/g, (m) => "_" + m.toLowerCase());
    return inner[camel] ?? inner[snake];
  };

  const byStatus = inner.byStatus ?? inner.by_status ?? {};

  const totalShipments = s("totalShipments") ?? s("total") as number;
  const delivered = s("deliveredShipments") ?? s("delivered") ?? byStatus.DELIVERED ?? byStatus.delivered as number;
  const successRate = totalShipments && delivered != null
    ? `${Math.round((Number(delivered) / Number(totalShipments)) * 100)}%`
    : null;

  const stats = [
    { icon: <Package size={16} />, value: totalShipments ?? "—", label: "Total Shipments" },
    { icon: <Truck size={16} />, value: s("activeShipments") ?? s("active") ?? "—", label: "Active Shipments" },
    { icon: <CheckCircle size={16} />, value: delivered ?? "—", label: "Delivered" },
    { icon: <AlertTriangle size={16} />, value: s("cancelledShipments") ?? s("cancelled") ?? byStatus.CANCELLED ?? byStatus.cancelled ?? "—", label: "Cancelled", warning: true },
    { icon: <TrendingUp size={16} />, value: successRate ?? "—", label: "Success Rate" },
    { icon: <Users size={16} />, value: data?.driversCount ?? "—", label: "Drivers" },
    { icon: <Users size={16} />, value: data?.operatorsCount ?? "—", label: "Operators" },
  ];

  return (
    <div>
      <PageHeader title="Shipping" italic="App" description="Logistics management, shipments, drivers and operators." />

      <div className={styles.statGrid}>
        {stats.map((st) => (
          <StatCard key={st.label} icon={st.icon} value={st.value} label={st.label} warning={st.warning} />
        ))}
      </div>
    </div>
  );
}
