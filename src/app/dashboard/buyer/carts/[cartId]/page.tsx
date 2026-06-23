"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Package, ShoppingCart, Trash2, User } from "lucide-react";
import { deleteCartItem, fetchCart, type Cart, type CartItem } from "@/services/buyer-actions";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { StatCard } from "@/components/ui/StatCard/StatCard";
import { Card, CardHeader } from "@/components/ui/Card/Card";
import { Table, TableRow } from "@/components/ui/Table/Table";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { Badge } from "@/components/ui/Badge/Badge";
import Button from "@/components/ui/Button/Button";
import { Modal } from "@/components/ui/Modal/Modal";
import styles from "../../buyer.module.css";

const headers = [
  { label: "Item", width: "1.2fr" },
  { label: "Product", width: "1.8fr" },
  { label: "Quantity", width: "0.8fr" },
  { label: "Created", width: "1.2fr" },
  { label: "Updated", width: "1.2fr" },
  { label: "Actions", width: "1fr" },
];

export default function CartDetailPage() {
  const { cartId } = useParams<{ cartId: string }>();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingItem, setDeletingItem] = useState<CartItem | null>(null);
  const [acting, setActing] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetchCart(cartId)
      .then((result) => setCart(result.cart))
      .catch(() => setCart(null))
      .finally(() => setLoading(false));
  }, [cartId]);

  useEffect(() => {
    let active = true;

    async function loadCart() {
      await Promise.resolve();
      if (!active) return;

      setLoading(true);
      try {
        const result = await fetchCart(cartId);
        if (active) setCart(result.cart);
      } catch {
        if (active) setCart(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadCart();
    return () => { active = false; };
  }, [cartId]);

  const handleDeleteItem = async () => {
    if (!deletingItem) return;
    setActing(true);
    try {
      await deleteCartItem(cartId, deletingItem.id);
      setDeletingItem(null);
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete cart item");
    } finally {
      setActing(false);
    }
  };

  if (loading) return <Spinner />;

  if (!cart) {
    return (
      <div className={styles.errorState}>
        <p className={styles.errorTitle}>Cart not found</p>
        <Link href="/dashboard/buyer/carts" className={styles.backLink}>
          <ArrowLeft size={14} /> Back to Carts
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/dashboard/buyer/carts" className={styles.backLink}>
        <ArrowLeft size={14} /> Back to Carts
      </Link>

      <PageHeader title="Cart" italic={cart.id.slice(0, 12)} />

      <div className={styles.statGrid}>
        <StatCard icon={<ShoppingCart size={16} />} value={cart.isEmpty ? "Empty" : "Active"} label="Status" warning={cart.isEmpty} />
        <StatCard icon={<Package size={16} />} value={cart.itemCount} label="Items" />
        <StatCard icon={<Package size={16} />} value={cart.totalQuantity} label="Quantity" />
        <StatCard icon={<User size={16} />} value={buyerDisplayName(cart)} label="Buyer" />
      </div>

      <div className={styles.sectionGrid}>
        <Card padding="lg">
          <CardHeader title="Cart Details" />
          <div className={styles.detailGrid}>
            <div className={styles.detailRow}><span className={styles.detailLabel}>Cart ID</span><span className={styles.monoText}>{cart.id}</span></div>
            <div className={styles.detailRow}><span className={styles.detailLabel}>Buyer</span><Link href={`/dashboard/buyer/buyers/${cart.buyerId}`} className={styles.linkText}>{buyerDisplayName(cart)}</Link></div>
            <div className={styles.detailRow}><span className={styles.detailLabel}>Created</span><span>{safeFormatDate(cart.createdAt)}</span></div>
            <div className={styles.detailRow}><span className={styles.detailLabel}>Updated</span><span>{safeFormatDate(cart.updatedAt)}</span></div>
            <div className={styles.detailRow}><span className={styles.detailLabel}>Last Item Activity</span><span>{safeFormatDate(cart.lastItemActivityAt)}</span></div>
            <div className={styles.detailRow}><span className={styles.detailLabel}>Status</span><Badge variant={cart.isEmpty ? "default" : "primary"}>{cart.isEmpty ? "Empty" : "Active"}</Badge></div>
          </div>
        </Card>
      </div>

      <Card padding="lg">
        <CardHeader title="Cart Items" description="Delete cart items through the buyer admin cart-item endpoint." />
        {!cart.items.length ? (
          <EmptyState title="No cart items" />
        ) : (
          <Table headers={headers}>
            {cart.items.map((item) => (
              <TableRow key={item.id} columns={[
                <span key="item" className={styles.monoText}>{item.id.slice(0, 12)}</span>,
                <span key="product" className={styles.monoText}>{item.productId}</span>,
                <span key="quantity" className={styles.primaryText}>{item.quantity}</span>,
                <span key="created" className={styles.mutedText}>{safeFormatDate(item.createdAt)}</span>,
                <span key="updated" className={styles.mutedText}>{safeFormatDate(item.updatedAt)}</span>,
                <span key="actions" className={styles.actionRow}>
                  <Button size="sm" variant="ghost" onClick={() => setDeletingItem(item)}><Trash2 size={12} /> Delete</Button>
                </span>,
              ]} />
            ))}
          </Table>
        )}
      </Card>

      <Modal
        open={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        title="Delete Cart Item"
        description="This removes the item from the buyer cart and updates the cart timestamp."
        actions={<>
          <button onClick={() => setDeletingItem(null)} className={`${styles.modalBtn} ${styles.modalBtnSecondary}`}>Cancel</button>
          <button onClick={handleDeleteItem} disabled={acting} className={`${styles.modalBtn} ${styles.modalBtnDanger}`}>{acting ? "Deleting..." : "Delete"}</button>
        </>}
      />
    </div>
  );
}

function buyerDisplayName(cart: Cart) {
  const name = [cart.buyer?.firstName, cart.buyer?.lastName].filter(Boolean).join(" ").trim();
  return name || cart.buyerId.slice(0, 12);
}

function safeFormatDate(value: string | null | undefined) {
  return value ? formatDate(value) : "—";
}
