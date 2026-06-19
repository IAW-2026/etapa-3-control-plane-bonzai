"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, Package, Users, DollarSign, Star, BookMarked } from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { StatCard } from "@/components/ui/StatCard/StatCard";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import { Card, CardHeader } from "@/components/ui/Card/Card";
import styles from "./page.module.css";

export default function SellerDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.getStatistics()
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error) {
    return (
      <div className={styles.errorState}>
        <p className={styles.errorTitle}>Could not load seller data</p>
        <p className={styles.errorHint}>Make sure the Seller App server is running and SELLER_API_URL is set correctly.</p>
      </div>
    );
  }

  const s = data?.summary || {};

  return (
    <div>
      <PageHeader title="Seller" italic="App" description="Product management, orders, reservations, reviews and users." />

      <div className={styles.statGrid}>
        <StatCard icon={<Users size={16} />} value={s.totalSellers ?? "—"} label="Sellers" />
        <StatCard icon={<Package size={16} />} value={s.totalProducts ?? "—"} label="Products" />
        <StatCard icon={<ShoppingCart size={16} />} value={s.totalOrders ?? "—"} label="Orders" />
        <StatCard icon={<DollarSign size={16} />} value={formatCurrency(s.totalRevenue ?? 0)} label="Revenue" />
        <StatCard icon={<Star size={16} />} value={s.averageRating ?? "—"} label="Avg Rating" />
        <StatCard icon={<BookMarked size={16} />} value={s.totalReservations ?? "—"} label="Reservations" />
        <StatCard icon={<Users size={16} />} value={s.uniqueBuyers ?? "—"} label="Buyers" />
        <StatCard icon={<ShoppingCart size={16} />} value={s.reservationConversionRate != null ? `${s.reservationConversionRate}%` : "—"} label="Conversion" warning />
      </div>

      {data?.topProducts?.length > 0 && (
        <Card padding="lg">
          <CardHeader title="Top Products" description="Best-selling products by revenue." />
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {data.topProducts.map((p: any, i: number) => (
              <div key={i} className={styles.topProductRow}>
                <div className={styles.rank}>
                  <span className={styles.rankNumber}>#{i + 1}</span>
                  <span className={styles.productName}>{p.name}</span>
                </div>
                <div className={styles.stats}>
                  <span className={styles.statLabel}>x{p.quantity}</span>
                  <span className={styles.productName}>{formatCurrency(p.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
