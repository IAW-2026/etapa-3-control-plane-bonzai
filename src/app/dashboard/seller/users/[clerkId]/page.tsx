"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Package, ShoppingCart, DollarSign, Star } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

export default function UserDetailPage() {
  const { clerkId } = useParams<{ clerkId: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState<"disable" | "enable" | null>(null);
  const [acting, setActing] = useState(false);

  const load = () => {
    setLoading(true);
    api.getUser(clerkId)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [clerkId]);

  const handleAction = async () => {
    setActing(true);
    try {
      if (confirmModal === "disable") await api.disableUser(clerkId);
      else await api.enableUser(clerkId);
      setConfirmModal(null);
      load();
    } catch { alert("Action failed"); }
    setActing(false);
  };

  if (loading) return <Spinner />;
  if (!data) return <p className="text-center py-12 text-[var(--color-text-muted)]">User not found.</p>;

  const { user, activity } = data;

  return (
    <div>
      <Link href="/dashboard/seller/users" className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.1em] text-[var(--color-text-muted)] no-underline hover:text-[var(--color-primary)] mb-4">
        <ArrowLeft size={14} /> Back to Users
      </Link>
      <PageHeader title="User" italic={user.email} />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<Package size={16} />} value={activity?.totalProducts ?? 0} label="Products" />
        <StatCard icon={<ShoppingCart size={16} />} value={activity?.totalOrders ?? 0} label="Orders" />
        <StatCard icon={<DollarSign size={16} />} value={formatCurrency(activity?.totalRevenue ?? 0)} label="Revenue" />
        <StatCard icon={<Star size={16} />} value={activity?.review ? `${activity.review.rating}/5` : "—"} label="Rating" />
      </div>
      <div className="flex gap-3 mb-8">
        <Badge variant={user.suspended ? "warning" : "success"}>{user.suspended ? "Disabled" : "Active"}</Badge>
        <Badge variant={user.approved ? "success" : "warning"}>{user.approved ? "Approved" : "Pending"}</Badge>
        {user.suspended ? (
          <Button size="sm" variant="secondary" onClick={() => setConfirmModal("enable")}>Enable User</Button>
        ) : (
          <Button size="sm" variant="ghost" onClick={() => setConfirmModal("disable")}>Disable User</Button>
        )}
      </div>
      {activity?.products?.length > 0 && (
        <div className="mb-8">
          <h3 className="text-[0.6rem] uppercase tracking-[0.15em] text-[#aaa] font-semibold mb-3">Products ({activity.products.length})</h3>
          <div className="space-y-2">
            {activity.products.map((p: any) => (
              <div key={p.id} className="flex justify-between items-center py-2 px-4 border border-[var(--color-border)] bg-[var(--color-bg)]">
                <span className="font-serif text-sm font-medium">{p.name}</span>
                <span className="font-serif text-sm">{formatCurrency(p.price)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <Modal open={!!confirmModal} onClose={() => setConfirmModal(null)}
        title={confirmModal === "disable" ? "Disable User" : "Enable User"}
        description={confirmModal === "disable" ? "This will suspend the seller." : "This will reactivate the seller."}
        actions={<>
          <button onClick={() => setConfirmModal(null)} className="text-[0.65rem] uppercase tracking-[0.1em] font-semibold px-4 py-2 border border-[var(--color-border)] bg-transparent text-[var(--color-text-muted)] cursor-pointer">Cancel</button>
          <button onClick={handleAction} disabled={acting} className="text-[0.65rem] uppercase tracking-[0.1em] font-semibold px-4 py-2 border-none bg-[var(--color-primary)] text-white cursor-pointer disabled:opacity-40">{acting ? "..." : "Confirm"}</button>
        </>}
      />
    </div>
  );
}
