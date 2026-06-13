"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Package, ShoppingCart, DollarSign, Star } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { StatCard } from "@/components/ui/StatCard/StatCard";
import { Badge } from "@/components/ui/Badge/Badge";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import Button from "@/components/ui/Button/Button";
import { Modal } from "@/components/ui/Modal/Modal";
import styles from "./page.module.css";

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
  if (!data) return <p className={styles.errorState}>User not found.</p>;

  const { user, activity } = data;

  return (
    <div>
      <Link href="/dashboard/seller/users" className={styles.backLink}>
        <ArrowLeft size={14} /> Back to Users
      </Link>
      <PageHeader title="User" italic={user.email} />
      <div className={styles.statGrid}>
        <StatCard icon={<Package size={16} />} value={activity?.totalProducts ?? 0} label="Products" />
        <StatCard icon={<ShoppingCart size={16} />} value={activity?.totalOrders ?? 0} label="Orders" />
        <StatCard icon={<DollarSign size={16} />} value={formatCurrency(activity?.totalRevenue ?? 0)} label="Revenue" />
        <StatCard icon={<Star size={16} />} value={activity?.review ? `${activity.review.rating}/5` : "—"} label="Rating" />
      </div>
      <div className={styles.badgeRow}>
        <Badge variant={user.suspended ? "warning" : "success"}>{user.suspended ? "Disabled" : "Active"}</Badge>
        <Badge variant={user.approved ? "success" : "warning"}>{user.approved ? "Approved" : "Pending"}</Badge>
        {user.suspended ? (
          <Button size="sm" variant="secondary" onClick={() => setConfirmModal("enable")}>Enable User</Button>
        ) : (
          <Button size="sm" variant="ghost" onClick={() => setConfirmModal("disable")}>Disable User</Button>
        )}
      </div>
      {activity?.products?.length > 0 && (
        <div style={{ marginBottom: "2rem" }}>
          <h3 className={styles.sectionTitle}>Products ({activity.products.length})</h3>
          <div className={styles.productList}>
            {activity.products.map((p: any) => (
              <div key={p.id} className={styles.productCard}>
                <span className={styles.productName}>{p.name}</span>
                <span className={styles.productPrice}>{formatCurrency(p.price)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <Modal open={!!confirmModal} onClose={() => setConfirmModal(null)}
        title={confirmModal === "disable" ? "Disable User" : "Enable User"}
        description={confirmModal === "disable" ? "This will suspend the seller." : "This will reactivate the seller."}
        actions={<>
          <button onClick={() => setConfirmModal(null)} className={`${styles.modalBtn} ${styles.modalBtnSecondary}`}>Cancel</button>
          <button onClick={handleAction} disabled={acting} className={`${styles.modalBtn} ${styles.modalBtnPrimary}`}>{acting ? "..." : "Confirm"}</button>
        </>}
      />
    </div>
  );
}
