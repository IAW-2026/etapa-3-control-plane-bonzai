"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, MapPin, Package, ShoppingCart, User } from "lucide-react";
import {
  fetchBuyer,
  fetchBuyerCart,
  fetchBuyerShippingAddresses,
  updateBuyer,
  type Buyer,
  type BuyerCartResponse,
  type BuyerShippingAddressesResponse,
} from "@/services/buyer-actions";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { StatCard } from "@/components/ui/StatCard/StatCard";
import { Card, CardHeader } from "@/components/ui/Card/Card";
import { Badge } from "@/components/ui/Badge/Badge";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { Table, TableRow } from "@/components/ui/Table/Table";
import Button from "@/components/ui/Button/Button";
import { Modal } from "@/components/ui/Modal/Modal";
import styles from "../../buyer.module.css";

const addressHeaders = [
  { label: "Label", width: "1fr" },
  { label: "Address", width: "1.8fr" },
  { label: "City", width: "1fr" },
  { label: "Province", width: "1fr" },
];

const cartHeaders = [
  { label: "Product", width: "1.5fr" },
  { label: "Quantity", width: "0.8fr" },
  { label: "Updated", width: "1.2fr" },
];

export default function BuyerDetailPage() {
  const { buyerId } = useParams<{ buyerId: string }>();
  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [addresses, setAddresses] = useState<BuyerShippingAddressesResponse | null>(null);
  const [cart, setCart] = useState<BuyerCartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [acting, setActing] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetchBuyer(buyerId),
      fetchBuyerShippingAddresses(buyerId),
      fetchBuyerCart(buyerId),
    ])
      .then(([buyerResult, addressResult, cartResult]) => {
        setBuyer(buyerResult.buyer);
        setAddresses(addressResult);
        setCart(cartResult);
      })
      .catch(() => {
        setBuyer(null);
        setAddresses(null);
        setCart(null);
      })
      .finally(() => setLoading(false));
  }, [buyerId]);

  useEffect(() => {
    let active = true;

    async function loadBuyer() {
      await Promise.resolve();
      if (!active) return;

      setLoading(true);
      try {
        const [buyerResult, addressResult, cartResult] = await Promise.all([
          fetchBuyer(buyerId),
          fetchBuyerShippingAddresses(buyerId),
          fetchBuyerCart(buyerId),
        ]);
        if (!active) return;
        setBuyer(buyerResult.buyer);
        setAddresses(addressResult);
        setCart(cartResult);
      } catch {
        if (!active) return;
        setBuyer(null);
        setAddresses(null);
        setCart(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadBuyer();
    return () => { active = false; };
  }, [buyerId]);

  const openEdit = () => {
    setFirstName(buyer?.firstName ?? "");
    setLastName(buyer?.lastName ?? "");
    setPhone(buyer?.phone ?? "");
    setEditOpen(true);
  };

  const handleSave = async () => {
    setActing(true);
    try {
      await updateBuyer(buyerId, {
        firstName,
        lastName,
        phone,
      });
      setEditOpen(false);
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to update buyer");
    } finally {
      setActing(false);
    }
  };

  if (loading) return <Spinner />;

  if (!buyer) {
    return (
      <div className={styles.errorState}>
        <p className={styles.errorTitle}>Buyer not found</p>
        <Link href="/dashboard/buyer/buyers" className={styles.backLink}>
          <ArrowLeft size={14} /> Back to Buyers
        </Link>
      </div>
    );
  }

  const fullName = buyerDisplayName(buyer.firstName, buyer.lastName, buyer.id);
  const addressList = addresses?.addresses ?? buyer.addresses ?? [];
  const buyerCart = cart?.cart ?? buyer.cart ?? null;
  const cartItems = buyerCart?.items ?? [];

  return (
    <div>
      <Link href="/dashboard/buyer/buyers" className={styles.backLink}>
        <ArrowLeft size={14} /> Back to Buyers
      </Link>

      <PageHeader
        title="Buyer"
        italic={fullName}
        action={<Button size="sm" variant="secondary" onClick={openEdit}>Edit Profile</Button>}
      />

      <div className={styles.statGrid}>
        <StatCard icon={<User size={16} />} value={buyer.isProfileComplete ? "Complete" : "Incomplete"} label="Profile" warning={!buyer.isProfileComplete} />
        <StatCard icon={<MapPin size={16} />} value={addressList.length} label="Shipping Addresses" />
        <StatCard icon={<ShoppingCart size={16} />} value={buyerCart ? buyerCart.itemCount : 0} label="Cart Items" />
        <StatCard icon={<Package size={16} />} value={buyerCart ? buyerCart.totalQuantity : 0} label="Cart Quantity" />
      </div>

      <div className={styles.sectionGrid}>
        <Card padding="lg">
          <CardHeader title="Profile" description="Editable buyer profile fields." />
          <div className={styles.detailGrid}>
            <div className={styles.detailRow}><span className={styles.detailLabel}>Buyer ID</span><span className={styles.monoText}>{buyer.id}</span></div>
            <div className={styles.detailRow}><span className={styles.detailLabel}>Clerk User ID</span><span className={styles.monoText}>{buyer.clerkUserId}</span></div>
            <div className={styles.detailRow}><span className={styles.detailLabel}>First Name</span><span>{buyer.firstName || "—"}</span></div>
            <div className={styles.detailRow}><span className={styles.detailLabel}>Last Name</span><span>{buyer.lastName || "—"}</span></div>
            <div className={styles.detailRow}><span className={styles.detailLabel}>Phone</span><span>{buyer.phone || "—"}</span></div>
            <div className={styles.detailRow}><span className={styles.detailLabel}>Created</span><span>{safeFormatDate(buyer.createdAt)}</span></div>
          </div>
        </Card>

        <Card padding="lg">
          <CardHeader title="Cart" description="Loaded through the dedicated buyer cart endpoint." />
          {buyerCart ? (
            <div className={styles.detailGrid}>
              <div className={styles.detailRow}><span className={styles.detailLabel}>Cart ID</span><Link href={`/dashboard/buyer/carts/${buyerCart.id}`} className={styles.linkText}>{buyerCart.id.slice(0, 12)}</Link></div>
              <div className={styles.detailRow}><span className={styles.detailLabel}>Status</span><Badge variant={buyerCart.isEmpty ? "default" : "primary"}>{buyerCart.isEmpty ? "Empty" : "Active"}</Badge></div>
              <div className={styles.detailRow}><span className={styles.detailLabel}>Last Activity</span><span>{safeFormatDate(buyerCart.lastItemActivityAt)}</span></div>
              <div className={styles.detailRow}><span className={styles.detailLabel}>Updated</span><span>{safeFormatDate(buyerCart.updatedAt)}</span></div>
            </div>
          ) : (
            <p className={styles.mutedText}>This buyer does not have a cart.</p>
          )}
        </Card>
      </div>

      <div className={styles.sectionGrid}>
        <Card padding="lg">
          <CardHeader title="Shipping Addresses" description="Loaded through the dedicated buyer addresses endpoint." />
          {!addressList.length ? (
            <EmptyState title="No shipping addresses" />
          ) : (
            <Table headers={addressHeaders}>
              {addressList.map((address) => (
                <TableRow key={address.id} columns={[
                  <span key="label" className={styles.primaryText}>{address.label || "Address"}</span>,
                  <span key="address" className={styles.mutedText}>{addressLine(address.address, address.floor, address.apartment)}</span>,
                  <span key="city" className={styles.mutedText}>{address.city}</span>,
                  <span key="province" className={styles.mutedText}>{address.province}</span>,
                ]} />
              ))}
            </Table>
          )}
        </Card>

        <Card padding="lg">
          <CardHeader title="Cart Items" />
          {!cartItems.length ? (
            <EmptyState title="No cart items" />
          ) : (
            <Table headers={cartHeaders}>
              {cartItems.map((item) => (
                <TableRow key={item.id} columns={[
                  <span key="product" className={styles.monoText}>{item.productId}</span>,
                  <span key="quantity" className={styles.primaryText}>{item.quantity}</span>,
                  <span key="updated" className={styles.mutedText}>{safeFormatDate(item.updatedAt)}</span>,
                ]} />
              ))}
            </Table>
          )}
        </Card>
      </div>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Buyer Profile"
        description="Only first name, last name and phone are supported by the buyer admin endpoint."
        actions={<>
          <button onClick={() => setEditOpen(false)} className={`${styles.modalBtn} ${styles.modalBtnSecondary}`}>Cancel</button>
          <button onClick={handleSave} disabled={acting} className={`${styles.modalBtn} ${styles.modalBtnPrimary}`}>{acting ? "Saving..." : "Save"}</button>
        </>}
      >
        <div className={styles.formGrid}>
          <label className={styles.formGroup}>
            <span className={styles.formLabel}>First Name</span>
            <input value={firstName} onChange={(event) => setFirstName(event.target.value)} className={styles.inputField} />
          </label>
          <label className={styles.formGroup}>
            <span className={styles.formLabel}>Last Name</span>
            <input value={lastName} onChange={(event) => setLastName(event.target.value)} className={styles.inputField} />
          </label>
          <label className={`${styles.formGroup} ${styles.formGroupWide}`}>
            <span className={styles.formLabel}>Phone</span>
            <input value={phone} onChange={(event) => setPhone(event.target.value)} className={styles.inputField} />
          </label>
        </div>
      </Modal>
    </div>
  );
}

function buyerDisplayName(firstName: string | null, lastName: string | null, fallbackId: string) {
  const name = [firstName, lastName].filter(Boolean).join(" ").trim();
  return name || fallbackId.slice(0, 12);
}

function addressLine(address: string, floor: string | null, apartment: string | null) {
  return [address, floor ? `Floor ${floor}` : null, apartment ? `Apt ${apartment}` : null].filter(Boolean).join(", ");
}

function safeFormatDate(value: string | null | undefined) {
  return value ? formatDate(value) : "—";
}
