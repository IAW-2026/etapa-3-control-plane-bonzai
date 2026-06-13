"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Star } from "lucide-react";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { StatCard } from "@/components/ui/StatCard/StatCard";
import { Table, TableRow } from "@/components/ui/Table/Table";
import { Pagination } from "@/components/ui/Pagination/Pagination";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import styles from "./page.module.css";

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
      <div className={styles.statGrid}>
        <StatCard icon={<Star size={16} />} value={data?.total ?? "—"} label="Total Reviews" />
      </div>
      {loading ? <Spinner /> : !data?.reviews?.length ? <EmptyState title="No reviews yet" /> : <>
        <Table headers={headers}>
          {data.reviews.map((r: any) => (
            <TableRow key={r.id} columns={[
              <span style={{ fontFamily: "var(--font-serif)", fontSize: "0.875rem", fontWeight: 500 }}>{r.seller?.email || "—"}</span>,
              <div style={{ display: "flex", gap: "0.125rem" }}>{renderStars(r.rating)}</div>,
              <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.comment || "—"}</span>,
              <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{formatDate(r.createdAt)}</span>,
            ]} />
          ))}
        </Table>
        <Pagination total={data.total} page={page} limit={10} />
      </>}
    </div>
  );
}
