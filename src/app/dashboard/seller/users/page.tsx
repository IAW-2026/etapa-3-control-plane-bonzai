"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Users } from "lucide-react";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { StatCard } from "@/components/ui/StatCard/StatCard";
import { Table, TableRow } from "@/components/ui/Table/Table";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { Pagination } from "@/components/ui/Pagination/Pagination";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { Badge } from "@/components/ui/Badge/Badge";
import styles from "./page.module.css";

const headers = [
  { label: "Email", width: "2fr" },
  { label: "Status", width: "1fr" },
  { label: "Approved", width: "1fr" },
  { label: "Created", width: "1.5fr" },
];

export default function UsersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = parseInt(searchParams.get("page") || "1", 10);
  const search = searchParams.get("search") || "";
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getUsers(page, 10, search)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [page, search]);

  return (
    <div>
      <PageHeader title="Users" italic="" description="All sellers registered on the platform." />
      <div className={styles.statGrid}>
        <StatCard icon={<Users size={16} />} value={data?.total ?? "—"} label="Total Sellers" />
      </div>
      <div className={styles.searchWrapper}><SearchInput placeholder="Search by email or ID..." /></div>
      {loading ? <Spinner /> : !data?.users?.length ? <EmptyState title="No users found" /> : <>
        <Table headers={headers}>
          {data.users.map((u: any) => (
             <TableRow key={u.id} onClick={() => router.push(`/dashboard/seller/users/${u.clerkId}`)} columns={[
              <span style={{ fontFamily: "var(--font-serif)", fontSize: "0.875rem", fontWeight: 500 }}>{u.email}</span>,
              <Badge variant={u.suspended ? "warning" : "success"}>{u.suspended ? "Disabled" : "Active"}</Badge>,
              <Badge variant={u.approved ? "success" : "warning"}>{u.approved ? "Yes" : "No"}</Badge>,
              <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{formatDate(u.createdAt)}</span>,
            ]} />
          ))}
        </Table>
        <Pagination total={data.total} page={page} limit={10} />
      </>}
    </div>
  );
}
