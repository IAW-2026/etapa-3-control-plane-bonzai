"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Users } from "lucide-react";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Table, TableRow } from "@/components/ui/Table";
import { SearchInput } from "@/components/ui/SearchInput";
import { Pagination } from "@/components/ui/Pagination";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";

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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <StatCard icon={<Users size={16} />} value={data?.total ?? "—"} label="Total Sellers" />
      </div>
      <div className="mb-6 max-w-sm"><SearchInput placeholder="Search by email or ID..." /></div>
      {loading ? <Spinner /> : !data?.users?.length ? <EmptyState title="No users found" /> : <>
        <Table headers={headers}>
          {data.users.map((u: any) => (
            <TableRow key={u.id} gridTemplate={headers.map((h) => h.width).join(" ")} onClick={() => router.push(`/dashboard/seller/users/${u.clerkId}`)} columns={[
              <span className="font-serif text-sm font-medium">{u.email}</span>,
              <Badge variant={u.suspended ? "warning" : "success"}>{u.suspended ? "Disabled" : "Active"}</Badge>,
              <Badge variant={u.approved ? "success" : "warning"}>{u.approved ? "Yes" : "No"}</Badge>,
              <span className="text-xs text-[var(--color-text-muted)]">{formatDate(u.createdAt)}</span>,
            ]} />
          ))}
        </Table>
        <Pagination total={data.total} page={page} limit={10} />
      </>}
    </div>
  );
}
