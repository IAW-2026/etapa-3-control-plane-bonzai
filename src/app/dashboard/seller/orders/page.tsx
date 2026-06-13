"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ShoppingCart, DollarSign } from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Table, TableRow } from "@/components/ui/Table";
import { SearchInput } from "@/components/ui/SearchInput";
import { Pagination } from "@/components/ui/Pagination";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";

const statusVariant: Record<string, "default" | "primary" | "success" | "warning" | "error"> = {
  PENDING: "warning",
  PAID: "primary",
  AWAITING_TRACKING: "warning",
  SHIPPED: "success",
  CANCELLED: "error",
};

const headers = [
  { label: "ID", width: "1fr" },
  { label: "Status", width: "1fr" },
  { label: "Seller", width: "1.5fr" },
  { label: "Total", width: "1fr" },
  { label: "Date", width: "1.5fr" },
];

export default function OrdersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = parseInt(searchParams.get("page") || "1", 10);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getOrders(page, 10, status, search)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [page, search, status]);

  return (
    <div>
      <PageHeader title="Orders" italic="" description="All orders across all sellers." />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <StatCard icon={<ShoppingCart size={16} />} value={data?.total ?? "—"} label="Total Orders" />
        <StatCard icon={<DollarSign size={16} />} value={data?.totalRevenue != null ? formatCurrency(data.totalRevenue) : "—"} label="Revenue" />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <SearchInput placeholder="Search by product..." />
        </div>
        <StatusFilter value={status} />
      </div>

      {loading ? (
        <Spinner />
      ) : !data?.orders?.length ? (
        <EmptyState title="No orders found" />
      ) : (
        <>
          <Table headers={headers}>
            {data.orders.map((o: any) => (
              <TableRow
                key={o.id}
                gridTemplate={headers.map((h) => h.width).join(" ")}
                onClick={() => router.push(`/dashboard/seller/orders/${o.id}`)}
                columns={[
                  <span className="font-mono text-xs text-[var(--color-text-muted)]">{o.id.slice(0, 8)}</span>,
                  <Badge variant={statusVariant[o.status] || "default"}>{o.status}</Badge>,
                  <span className="text-xs text-[var(--color-text-muted)]">{o.sellerEmail || "—"}</span>,
                  <span className="font-serif text-sm font-medium">{formatCurrency(o.total)}</span>,
                  <span className="text-xs text-[var(--color-text-muted)]">{formatDate(o.createdAt)}</span>,
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

function StatusFilter({ value }: { value: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setStatus = (s: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (s) params.set("status", s);
    else params.delete("status");
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  return (
    <select
      value={value}
      onChange={(e) => setStatus(e.target.value)}
      className="w-full sm:w-auto px-3 py-[0.6rem] text-sm border-[1.5px] border-[var(--color-border)] rounded-xl outline-none bg-white"
    >
      <option value="">All Status</option>
      <option value="PENDING">Pending</option>
      <option value="PAID">Paid</option>
      <option value="AWAITING_TRACKING">Awaiting Tracking</option>
      <option value="SHIPPED">Shipped</option>
      <option value="CANCELLED">Cancelled</option>
    </select>
  );
}
