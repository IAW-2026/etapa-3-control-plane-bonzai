"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Package, ShoppingCart, Users } from "lucide-react";
import {
  fetchBuyers,
  fetchCarts,
  fetchShippingAddresses,
  type BuyerListResponse,
  type CartListResponse,
  type ShippingAddressListResponse,
} from "@/services/buyer-actions";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { StatCard } from "@/components/ui/StatCard/StatCard";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import { Card } from "@/components/ui/Card/Card";
import styles from "./buyer.module.css";

export default function BuyerPage() {
  const [buyers, setBuyers] = useState<BuyerListResponse | null>(null);
  const [addresses, setAddresses] = useState<ShippingAddressListResponse | null>(null);
  const [carts, setCarts] = useState<CartListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetchBuyers(1, 25),
      fetchShippingAddresses(1, 25),
      fetchCarts(1, 25),
    ])
      .then(([buyerResult, addressResult, cartResult]) => {
        setBuyers(buyerResult);
        setAddresses(addressResult);
        setCarts(cartResult);
      })
      .catch((e: Error) => setError(e.message || "Unknown error"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  if (error) {
    return (
      <div className={styles.errorState}>
        <p className={styles.errorTitle}>Could not load Buyer data</p>
        <p className={styles.errorHint}>{error}</p>
      </div>
    );
  }

  const completeProfiles = buyers?.buyers.filter((buyer) => buyer.isProfileComplete).length ?? 0;
  const sampledProfiles = buyers?.buyers.length ?? 0;
  const cartItemsOnPage = carts?.carts.reduce((total, cart) => total + cart.itemCount, 0) ?? 0;

  return (
    <div>
      <PageHeader title="Buyer" italic="App" description="Buyer profiles, shipping addresses and carts from admin endpoints." />

      <div className={styles.statGrid}>
        <StatCard icon={<Users size={16} />} value={buyers?.total ?? "—"} label="Buyer Profiles" />
        <StatCard icon={<MapPin size={16} />} value={addresses?.total ?? "—"} label="Shipping Addresses" />
        <StatCard icon={<ShoppingCart size={16} />} value={carts?.total ?? "—"} label="Carts" />
        <StatCard icon={<Package size={16} />} value={cartItemsOnPage} label="Cart Items Loaded" />
      </div>

      <div className={styles.sectionGrid}>
        <OverviewCard
          href="/dashboard/buyer/buyers"
          icon={<Users size={18} />}
          title="Buyers"
          description={`${completeProfiles}/${sampledProfiles} loaded profiles are complete. Search and edit buyer profile data.`}
        />
        <OverviewCard
          href="/dashboard/buyer/shipping-addresses"
          icon={<MapPin size={18} />}
          title="Shipping Addresses"
          description="Review, edit and delete buyer shipping addresses across the buyer service."
        />
        <OverviewCard
          href="/dashboard/buyer/carts"
          icon={<ShoppingCart size={18} />}
          title="Carts"
          description="Inspect buyer carts and remove cart items when an admin needs to intervene."
        />
      </div>
    </div>
  );
}

function OverviewCard({ href, icon, title, description }: { href: string; icon: React.ReactNode; title: string; description: string }) {
  return (
    <Link href={href} className={styles.overviewCard}>
      <Card padding="lg">
        <div className={styles.overviewCardBody}>
          <span className={styles.overviewIcon}>{icon}</span>
          <span className={styles.overviewTitle}>{title}</span>
          <span className={styles.overviewDescription}>{description}</span>
        </div>
      </Card>
    </Link>
  );
}
