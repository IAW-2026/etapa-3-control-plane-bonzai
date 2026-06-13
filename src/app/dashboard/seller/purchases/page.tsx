"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CreditCard, DollarSign } from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Table, TableRow } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";

const headers = [
  { label: "ID", width: "1.5fr" },
  { label: "Date", width: "1.5fr" },
  { label: "Orders", width: "1fr" },
  { label: "Items", width: "1fr" },
  { label: "Total", width: "1fr" },
];

export default function PurchasesPage() {
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1", 10);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getPurchases(page)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div>
      <PageHeader title="Purchases" italic="" description="All purchases across the platform." />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <StatCard icon={<CreditCard size={16} />} value={data?.total ?? "—"} label="Total Purchases" />
      </div>

      {loading ? (
        <Spinner />
      ) : !data?.purchases?.length ? (
        <EmptyState title="No purchases yet" />
      ) : (
        <>
          <Table headers={headers}>
            {data.purchases.map((p: any) => (
              <TableRow
                key={p.id}
                gridTemplate={headers.map((h) => h.width).join(" ")}
                columns={[
                  <span className="font-mono text-xs text-[var(--color-text-muted)]">{p.id.slice(0, 8)}</span>,
                  <span className="text-sm">{formatDate(p.createdAt)}</span>,
                  <Badge variant="primary">{p.orders?.length || 0}</Badge>,
                  <span>{(p.orders || []).reduce((s: number, o: any) => s + (o.items?.length || 0), 0)}</span>,
                  <span className="font-serif font-medium text-sm">
                    {formatCurrency((p.orders || []).reduce((s: number, o: any) => s + o.total, 0))}
                  </span>,
                ]}
              />
            ))}
          </Table>
          <Pagination total={data.total} page={page} limit={10} />
        </>
      )}
    </div>
  );
}
