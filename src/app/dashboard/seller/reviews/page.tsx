"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { api } from "@/lib/api";
import { formatDate, useSafePage } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { StatCard } from "@/components/ui/StatCard/StatCard";
import { Table, TableRow } from "@/components/ui/Table/Table";
import { Pagination } from "@/components/ui/Pagination/Pagination";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { ExportCsvButton } from "@/components/ui/ExportCsvButton/ExportCsvButton";
import styles from "./page.module.css";

const headers = [
  { label: "Seller", width: "1.5fr" },
  { label: "Rating", width: "1fr" },
  { label: "Comment", width: "3fr" },
  { label: "Date", width: "1.5fr" },
];

export default function ReviewsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = useSafePage();
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

  useEffect(() => {
    if (!data) return;
    const results = data?.reviews;
    const total = data?.total;
    if (!Array.isArray(results) || results.length > 0) return;
    if (page <= 1) return;
    let target = 1;
    if (total && total > 0) {
      const totalPages = Math.ceil(total / 10);
      target = page <= totalPages ? page : totalPages;
    }
    if (target === page) return;
    const url = new URL(window.location.href);
    url.searchParams.set("page", String(target));
    router.replace(url.pathname + url.search);
  }, [data, page]);

  const renderStars = (r: number) => Array.from({ length: 5 }, (_, i) => (
    <Star key={i} size={12} fill={i < r ? "var(--color-accent)" : "none"} color={i < r ? "var(--color-accent)" : "var(--color-border)"} />
  ));

  return (
    <div>
      <PageHeader title="Reviews" italic="" description="Seller reviews from buyers." action={<ExportCsvButton filename="reviews.csv" headers={["Seller", "Rating", "Comment", "Date"]} rows={data?.reviews?.map((r: any) => [r.seller?.email || "", String(r.rating), r.comment || "", formatDate(r.createdAt)]) || []} />} />
      <div className={styles.statGrid}>
        <StatCard icon={<Star size={16} />} value={data?.total ?? "—"} label="Total Reviews" />
      </div>
      <div className={styles.filterWrapper}><RatingFilter value={rating} /></div>
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

function RatingFilter({ value }: { value: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setRating = (r: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (r) params.set("rating", r);
    else params.delete("rating");
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  return (
    <select value={value} onChange={(e) => setRating(e.target.value)} className={styles.select}>
      <option value="">All Ratings</option>
      <option value="5">5 Stars</option>
      <option value="4">4 Stars & up</option>
      <option value="3">3 Stars & up</option>
      <option value="2">2 Stars & up</option>
      <option value="1">1 Star & up</option>
    </select>
  );
}
