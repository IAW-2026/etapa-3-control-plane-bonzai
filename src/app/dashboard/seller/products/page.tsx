"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Package, X, EyeOff, Eye } from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Table, TableRow } from "@/components/ui/Table";
import { SearchInput } from "@/components/ui/SearchInput";
import { Pagination } from "@/components/ui/Pagination";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";

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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <StatCard icon={<Package size={16} />} value={data?.total ?? "—"} label="Total Products" />
      </div>
      <div className="mb-6 max-w-sm"><SearchInput placeholder="Search products..." /></div>
      {loading ? <Spinner /> : !data?.products?.length ? <EmptyState title="No products found" /> : <>
        <Table headers={headers}>
          {data.products.map((p: any) => (
            <TableRow
              key={p.id}
              gridTemplate={headers.map((h) => h.width).join(" ")}
              onClick={() => setModalProduct(p)}
              columns={[
                <span className="font-serif text-sm font-medium">{p.name}</span>,
                <span className="text-xs text-[var(--color-text-muted)]">{p.seller?.email || "—"}</span>,
                <span className="font-serif text-sm font-medium">{formatCurrency(p.price)}</span>,
                <span>{p.stock}</span>,
                <Badge variant={modVariant(p.moderationStatus)}>{p.moderationStatus}</Badge>,
              ]}
            />
          ))}
        </Table>
        <Pagination total={data.total} page={page} limit={10} />
      </>}

      {modalProduct && (
        <div
          className="fixed inset-0 bg-[rgba(0,0,0,0.3)] flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={() => setModalProduct(null)}
        >
          <div
            className="bg-white border border-[var(--color-border)] w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
              <span className="text-[0.7rem] uppercase tracking-[0.1em] font-semibold text-[var(--color-text-muted)]">Product Detail</span>
              <button
                onClick={() => setModalProduct(null)}
                className="bg-none border-none cursor-pointer text-[var(--color-text-muted)] p-0 flex"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5">
              <div className="w-full h-[180px] sm:h-[220px] bg-[rgba(27,61,47,0.04)] flex items-center justify-center mb-5 overflow-hidden">
                {modalProduct.imageUrl ? (
                  <img src={modalProduct.imageUrl} alt={modalProduct.name} className="w-full h-full object-cover" />
                ) : (
                  <Package size={48} className="text-[var(--color-text-muted)] opacity-40" />
                )}
              </div>

              <div className="mb-3">
                <h2 className="font-serif text-[1.4rem] font-medium text-[var(--color-primary)] m-0">
                  {modalProduct.name}
                </h2>
                {modalProduct.category && (
                  <span className="text-[0.65rem] uppercase tracking-[0.1em] text-[var(--color-text-muted)]">
                    {modalProduct.category.name}
                  </span>
                )}
              </div>

              <div className="text-[1.75rem] font-serif font-semibold text-[var(--color-primary)] mb-4">
                {formatCurrency(modalProduct.price)}
              </div>

              {modalProduct.description && (
                <p className="text-[0.85rem] text-[var(--color-text)] leading-relaxed mb-4">
                  {modalProduct.description}
                </p>
              )}

              <div className="flex gap-2 flex-wrap mb-4">
                <span className={`text-[0.6rem] uppercase tracking-[0.1em] font-semibold px-2 py-1 border ${
                  modalProduct.stock > 0
                    ? "text-[var(--color-success)] border-[rgba(22,163,74,0.2)] bg-[rgba(22,163,74,0.05)]"
                    : "text-[var(--color-warning)] border-[rgba(139,115,85,0.2)] bg-[rgba(139,115,85,0.05)]"
                }`}>
                  {modalProduct.stock > 0 ? `${modalProduct.stock} in stock` : "Out of stock"}
                </span>
                {modalProduct.suspended && (
                  <span className="text-[0.6rem] uppercase tracking-[0.1em] font-semibold px-2 py-1 border text-[#b8860b] border-[rgba(184,134,11,0.2)] bg-[rgba(184,134,11,0.05)]">
                    Suspended
                  </span>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t border-[var(--color-border)]">
                <button
                  onClick={() => handleToggleSuspend(modalProduct)}
                  className={`inline-flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.1em] font-semibold px-4 py-2 border transition-all duration-[0.4s] cursor-pointer ${
                    modalProduct.suspended
                      ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] hover:bg-black"
                      : "bg-transparent text-[#b8860b] border-[rgba(184,134,11,0.3)] hover:bg-[#b8860b] hover:text-white"
                  }`}
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
