"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchWallets } from "@/services/payments-actions";
import { formatARS, formatDate, useSafePage } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { Table, TableRow } from "@/components/ui/Table/Table";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { Pagination } from "@/components/ui/Pagination/Pagination";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import styles from "./page.module.css";

const headers = [
  { label: "User ID", width: "1.5fr" },
  { label: "Available", width: "1fr" },
  { label: "Held", width: "1fr" },
  { label: "Total", width: "1fr" },
  { label: "Updated", width: "1.2fr" },
];

export default function WalletsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = useSafePage();
  const search = searchParams.get("search") || "";
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchWallets(page, 10, search)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => {
    if (!data) return;
    const results = data?.wallets;
    const total = data?.pagination?.total;
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

  const pagination = data?.pagination || {};

  return (
    <div>
      <PageHeader title="Wallets" italic="" description="Seller wallets and balance management." />

      <div className={styles.filterRow}>
        <div className={styles.searchWrapper}>
          <SearchInput placeholder="Search by User ID..." />
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : !data?.wallets?.length ? (
        <EmptyState title="No wallets found" />
      ) : (
        <>
          <Table headers={headers}>
            {data.wallets.map((w: any) => (
              <TableRow
                key={w.id}
                onClick={() => router.push(`/dashboard/payments/wallets/${w.userId}`)}
                columns={[
                  <span key="uid" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>{w.userId?.slice(0, 16)}</span>,
                  <span key="avail" style={{ fontFamily: "var(--font-serif)", fontSize: "0.875rem", fontWeight: 500, color: "var(--color-primary)" }}>{formatARS(w.availableBalance)}</span>,
                  <span key="held" style={{ fontFamily: "var(--font-serif)", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>{formatARS(w.heldBalance)}</span>,
                  <span key="total" style={{ fontFamily: "var(--font-serif)", fontSize: "0.875rem", fontWeight: 500 }}>{formatARS(w.totalBalance)}</span>,
                  <span key="date" style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{formatDate(w.updatedAt)}</span>,
                ]}
              />
            ))}
          </Table>
          <Pagination total={pagination.total || 0} page={page} limit={10} />
        </>
      )}
    </div>
  );
}
