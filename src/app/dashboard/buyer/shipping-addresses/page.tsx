"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MapPin, Trash2, Users } from "lucide-react";
import {
  deleteShippingAddress,
  fetchShippingAddresses,
  updateShippingAddress,
  type ShippingAddress,
  type ShippingAddressListResponse,
} from "@/services/buyer-actions";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { StatCard } from "@/components/ui/StatCard/StatCard";
import { Table, TableRow } from "@/components/ui/Table/Table";
import { Pagination } from "@/components/ui/Pagination/Pagination";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import Button from "@/components/ui/Button/Button";
import { Modal } from "@/components/ui/Modal/Modal";
import styles from "../buyer.module.css";

const headers = [
  { label: "Label", width: "1fr" },
  { label: "Buyer", width: "1.2fr" },
  { label: "Address", width: "1.8fr" },
  { label: "City", width: "1fr" },
  { label: "Province", width: "1fr" },
  { label: "Updated", width: "1.2fr" },
  { label: "Actions", width: "1.2fr" },
];

interface AddressFormState {
  label: string;
  address: string;
  apartment: string;
  floor: string;
  city: string;
  postalCode: string;
  province: string;
  country: "Argentina";
}

const emptyForm: AddressFormState = {
  label: "",
  address: "",
  apartment: "",
  floor: "",
  city: "",
  postalCode: "",
  province: "",
  country: "Argentina",
};

export default function ShippingAddressesPage() {
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1", 10);
  const [data, setData] = useState<ShippingAddressListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingAddress, setEditingAddress] = useState<ShippingAddress | null>(null);
  const [deletingAddress, setDeletingAddress] = useState<ShippingAddress | null>(null);
  const [form, setForm] = useState<AddressFormState>(emptyForm);
  const [acting, setActing] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetchShippingAddresses(page, 10)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    let active = true;

    async function loadAddresses() {
      await Promise.resolve();
      if (!active) return;

      setLoading(true);
      try {
        const result = await fetchShippingAddresses(page, 10);
        if (active) setData(result);
      } catch {
        if (active) setData(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadAddresses();
    return () => { active = false; };
  }, [page]);

  const openEdit = (address: ShippingAddress) => {
    setEditingAddress(address);
    setForm({
      label: address.label ?? "",
      address: address.address,
      apartment: address.apartment ?? "",
      floor: address.floor ?? "",
      city: address.city,
      postalCode: address.postalCode,
      province: address.province,
      country: "Argentina",
    });
  };

  const handleUpdate = async () => {
    if (!editingAddress) return;
    setActing(true);
    try {
      await updateShippingAddress(editingAddress.id, {
        label: form.label,
        address: form.address,
        apartment: form.apartment,
        floor: form.floor,
        city: form.city,
        postalCode: form.postalCode,
        province: form.province,
        country: form.country,
      });
      setEditingAddress(null);
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to update shipping address");
    } finally {
      setActing(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingAddress) return;
    setActing(true);
    try {
      await deleteShippingAddress(deletingAddress.id);
      setDeletingAddress(null);
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete shipping address");
    } finally {
      setActing(false);
    }
  };

  const addresses = data?.addresses ?? [];
  const buyerCount = new Set(addresses.map((address) => address.buyerId)).size;

  return (
    <div>
      <PageHeader title="Shipping Addresses" italic="" description="Buyer shipping addresses from the admin endpoint." />

      <div className={styles.statGrid}>
        <StatCard icon={<MapPin size={16} />} value={data?.total ?? "—"} label="Total Addresses" />
        <StatCard icon={<Users size={16} />} value={buyerCount} label="Buyers Loaded" />
      </div>

      {loading ? (
        <Spinner />
      ) : !addresses.length ? (
        <EmptyState title="No shipping addresses found" />
      ) : (
        <>
          <Table headers={headers}>
            {addresses.map((address) => (
              <TableRow key={address.id} columns={[
                <span key="label" className={styles.primaryText}>{address.label || "Address"}</span>,
                <Link key="buyer" href={`/dashboard/buyer/buyers/${address.buyerId}`} className={styles.linkText}>{buyerDisplayName(address)}</Link>,
                <span key="address" className={styles.mutedText}>{addressLine(address)}</span>,
                <span key="city" className={styles.mutedText}>{address.city}</span>,
                <span key="province" className={styles.mutedText}>{address.province}</span>,
                <span key="updated" className={styles.mutedText}>{safeFormatDate(address.updatedAt)}</span>,
                <span key="actions" className={styles.actionRow}>
                  <Button size="sm" variant="secondary" onClick={() => openEdit(address)}>Edit</Button>
                  <Button size="sm" variant="ghost" onClick={() => setDeletingAddress(address)}><Trash2 size={12} /> Delete</Button>
                </span>,
              ]} />
            ))}
          </Table>
          <Pagination total={data?.total ?? 0} page={page} limit={10} />
        </>
      )}

      <Modal
        open={!!editingAddress}
        onClose={() => setEditingAddress(null)}
        title="Edit Shipping Address"
        description="Update the fields supported by the buyer shipping-address admin endpoint."
        actions={<>
          <button onClick={() => setEditingAddress(null)} className={`${styles.modalBtn} ${styles.modalBtnSecondary}`}>Cancel</button>
          <button onClick={handleUpdate} disabled={acting || !form.address || !form.city || !form.postalCode || !form.province} className={`${styles.modalBtn} ${styles.modalBtnPrimary}`}>{acting ? "Saving..." : "Save"}</button>
        </>}
      >
        <div className={styles.formGrid}>
          <Field label="Label" value={form.label} onChange={(value) => setForm((current) => ({ ...current, label: value }))} />
          <Field label="Address" value={form.address} onChange={(value) => setForm((current) => ({ ...current, address: value }))} required />
          <Field label="Apartment" value={form.apartment} onChange={(value) => setForm((current) => ({ ...current, apartment: value }))} />
          <Field label="Floor" value={form.floor} onChange={(value) => setForm((current) => ({ ...current, floor: value }))} />
          <Field label="City" value={form.city} onChange={(value) => setForm((current) => ({ ...current, city: value }))} required />
          <Field label="Postal Code" value={form.postalCode} onChange={(value) => setForm((current) => ({ ...current, postalCode: value }))} required />
          <Field label="Province" value={form.province} onChange={(value) => setForm((current) => ({ ...current, province: value }))} required />
          <label className={styles.formGroup}>
            <span className={styles.formLabel}>Country</span>
            <input value={form.country} disabled className={styles.inputField} />
          </label>
        </div>
      </Modal>

      <Modal
        open={!!deletingAddress}
        onClose={() => setDeletingAddress(null)}
        title="Delete Shipping Address"
        description="This permanently removes the address from the buyer service."
        actions={<>
          <button onClick={() => setDeletingAddress(null)} className={`${styles.modalBtn} ${styles.modalBtnSecondary}`}>Cancel</button>
          <button onClick={handleDelete} disabled={acting} className={`${styles.modalBtn} ${styles.modalBtnDanger}`}>{acting ? "Deleting..." : "Delete"}</button>
        </>}
      />
    </div>
  );
}

function Field({ label, value, onChange, required = false }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) {
  return (
    <label className={styles.formGroup}>
      <span className={styles.formLabel}>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} required={required} className={styles.inputField} />
    </label>
  );
}

function buyerDisplayName(address: ShippingAddress) {
  const buyer = address.buyer;
  const name = [buyer?.firstName, buyer?.lastName].filter(Boolean).join(" ").trim();
  return name || address.buyerId.slice(0, 12);
}

function addressLine(address: ShippingAddress) {
  return [address.address, address.floor ? `Floor ${address.floor}` : null, address.apartment ? `Apt ${address.apartment}` : null]
    .filter(Boolean)
    .join(", ");
}

function safeFormatDate(value: string | null | undefined) {
  return value ? formatDate(value) : "—";
}
