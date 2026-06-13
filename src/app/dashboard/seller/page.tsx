"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, Package, Users, DollarSign, Star, BookMarked } from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Spinner } from "@/components/ui/Spinner";
import { Card, CardHeader } from "@/components/ui/Card";

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
      <div className="text-center py-16">
        <p className="font-serif text-xl text-[var(--color-text-muted)]">Could not load seller data</p>
        <p className="text-sm text-[#aaa] mt-2">Make sure the Seller App server is running and NEXT_PUBLIC_API_URL is set correctly.</p>
      </div>
    );
  }

  const s = data?.summary || {};

  return (
    <div>
      <PageHeader title="Seller" italic="App" description="Product management, orders, reservations, reviews and users." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
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
        <Card padding="lg" className="border border-[var(--color-border)] bg-[var(--color-bg)]">
          <CardHeader title="Top Products" description="Best-selling products by revenue." />
          <div className="space-y-3">
            {data.topProducts.map((p: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-[var(--color-border)] last:border-b-0">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[var(--color-text-muted)] w-5">#{i + 1}</span>
                  <span className="font-serif text-sm font-medium">{p.name}</span>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-xs text-[var(--color-text-muted)]">x{p.quantity}</span>
                  <span className="font-serif text-sm font-medium">{formatCurrency(p.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
