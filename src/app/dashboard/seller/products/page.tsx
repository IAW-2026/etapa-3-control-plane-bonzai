"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Package, X, EyeOff, Eye } from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { StatCard } from "@/components/ui/StatCard/StatCard";
import { Table, TableRow } from "@/components/ui/Table/Table";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { Pagination } from "@/components/ui/Pagination/Pagination";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { Badge } from "@/components/ui/Badge/Badge";
import styles from "./page.module.css";

const modVariant = (s: string) =>
  s === "ACTIVE" ? "success" as const
    : s === "PENDING" ? "warning" as const
    : s === "REJECTED" ? "error" as const
    : "default" as const;

const headers = [
  { label: "Name", width: "2fr" },
  { label: "Seller", width: "1.5fr" },
  { label: "Price", width: "1fr" },
  { label: "Stock", width: "1fr" },
  { label: "Status", width: "1fr" },
];

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1", 10);
  const search = searchParams.get("search") || "";
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalProduct, setModalProduct] = useState<any>(null);

  const load = () => {
    setLoading(true);
    api.getProducts(page, 10, search, true)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, search]);

  const handleToggleSuspend = async (product: any) => {
    const newSuspended = !product.suspended;
    try {
      const res = await api.updateProduct(product.id, { suspended: newSuspended });
      if (res.product) setModalProduct(res.product);
      load();
    } catch { alert("Failed to update product"); }
  };

  return (
    <div>
      <PageHeader title="Products" italic="" description="All products across all sellers." />
      <div className={styles.statGrid}>
        <StatCard icon={<Package size={16} />} value={data?.total ?? "—"} label="Total Products" />
      </div>
      <div className={styles.searchWrapper}><SearchInput placeholder="Search products..." /></div>
      {loading ? <Spinner /> : !data?.products?.length ? <EmptyState title="No products found" /> : <>
        <Table headers={headers}>
          {data.products.map((p: any) => (
            <TableRow
              key={p.id}
              onClick={() => setModalProduct(p)}
              columns={[
                <span style={{ fontFamily: "var(--font-serif)", fontSize: "0.875rem", fontWeight: 500 }}>{p.name}</span>,
                <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{p.seller?.email || "—"}</span>,
                <span style={{ fontFamily: "var(--font-serif)", fontSize: "0.875rem", fontWeight: 500 }}>{formatCurrency(p.price)}</span>,
                <span>{p.stock}</span>,
                <Badge variant={modVariant(p.moderationStatus)}>{p.moderationStatus}</Badge>,
              ]}
            />
          ))}
        </Table>
        <Pagination total={data.total} page={page} limit={10} />
      </>}

      {modalProduct && (
        <div className={styles.overlay} onClick={() => setModalProduct(null)}>
          <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
            <div className={styles.dialogHeader}>
              <span className={styles.dialogTitle}>Product Detail</span>
              <button onClick={() => setModalProduct(null)} className={styles.closeButton}>
                <X size={16} />
              </button>
            </div>

            <div className={styles.dialogBody}>
              <div className={styles.imageWrapper}>
                {modalProduct.imageUrl ? (
                  <img src={modalProduct.imageUrl} alt={modalProduct.name} className={styles.productImage} />
                ) : (
                  <Package size={48} style={{ color: "var(--color-text-muted)", opacity: 0.4 }} />
                )}
              </div>

              <div style={{ marginBottom: "0.75rem" }}>
                <h2 className={styles.productName}>{modalProduct.name}</h2>
                {modalProduct.category && (
                  <span className={styles.category}>{modalProduct.category.name}</span>
                )}
              </div>

              <div className={styles.price}>{formatCurrency(modalProduct.price)}</div>

              {modalProduct.description && (
                <p className={styles.description}>{modalProduct.description}</p>
              )}

              <div className={styles.tagGroup}>
                <span className={`${styles.tag} ${modalProduct.stock > 0 ? styles.tagInStock : styles.tagOutOfStock}`}>
                  {modalProduct.stock > 0 ? `${modalProduct.stock} in stock` : "Out of stock"}
                </span>
                {modalProduct.suspended && (
                  <span className={`${styles.tag} ${styles.tagSuspended}`}>Suspended</span>
                )}
              </div>

              <div className={styles.actionRow}>
                <button
                  onClick={() => handleToggleSuspend(modalProduct)}
                  className={`${styles.actionButton} ${modalProduct.suspended ? styles.actionButtonReactivate : styles.actionButtonSuspend}`}
                >
                  {modalProduct.suspended ? <Eye size={12} /> : <EyeOff size={12} />}
                  {modalProduct.suspended ? "Reactivate" : "Suspend"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
