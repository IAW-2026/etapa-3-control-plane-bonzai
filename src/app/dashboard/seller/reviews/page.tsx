"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Star } from "lucide-react";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Table, TableRow } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";

const headers = [
  { label: "Seller", width: "1.5fr" },
  { label: "Rating", width: "1fr" },
  { label: "Comment", width: "3fr" },
  { label: "Date", width: "1.5fr" },
];

export default function ReviewsPage() {
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1", 10);
  const rating = searchParams.get("rating") || "";
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getReviews(page, 10, rating)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [page, rating]);

  const renderStars = (r: number) => Array.from({ length: 5 }, (_, i) => (
    <Star key={i} size={12} fill={i < r ? "var(--color-accent)" : "none"} color={i < r ? "var(--color-accent)" : "var(--color-border)"} />
  ));

  return (
    <div>
      <PageHeader title="Reviews" italic="" description="Seller reviews from buyers." />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <StatCard icon={<Star size={16} />} value={data?.total ?? "—"} label="Total Reviews" />
      </div>
      {loading ? <Spinner /> : !data?.reviews?.length ? <EmptyState title="No reviews yet" /> : <>
        <Table headers={headers}>
          {data.reviews.map((r: any) => (
            <TableRow key={r.id} gridTemplate={headers.map((h) => h.width).join(" ")} columns={[
              <span className="font-serif text-sm font-medium">{r.seller?.email || "—"}</span>,
              <div className="flex gap-0.5">{renderStars(r.rating)}</div>,
              <span className="text-xs text-[var(--color-text-muted)] truncate">{r.comment || "—"}</span>,
              <span className="text-xs text-[var(--color-text-muted)]">{formatDate(r.createdAt)}</span>,
            ]} />
          ))}
        </Table>
        <Pagination total={data.total} page={page} limit={10} />
      </>}
    </div>
  );
}
