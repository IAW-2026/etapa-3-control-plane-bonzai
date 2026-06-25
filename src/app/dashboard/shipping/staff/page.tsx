"use client";

import Link from "next/link";
import { Truck, UserCog } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import styles from "./page.module.css";

const staffSections = [
  {
    name: "Drivers",
    desc: "Field curators responsible for physical plant transport and delivery.",
    href: "/dashboard/shipping/staff/drivers",
    icon: Truck,
    color: "var(--color-primary)",
  },
  {
    name: "Operators",
    desc: "Logistics administrators who process and assign shipments.",
    href: "/dashboard/shipping/staff/operators",
    icon: UserCog,
    color: "var(--color-accent)",
  },
];

export default function StaffPage() {
  return (
    <div>
      <PageHeader title="Logistics" italic="Staff" description="Manage drivers and operators across the shipping network." />

      <div className={styles.cardGrid}>
        {staffSections.map((section) => (
          <Link key={section.name} href={section.href} className={styles.staffCard}>
            <div className={styles.staffIcon} style={{ background: "rgba(27,61,47,0.05)", color: section.color }}>
              <section.icon size={22} />
            </div>
            <div className={styles.staffBody}>
              <span className={styles.staffName}>{section.name}</span>
              <p className={styles.staffDesc}>{section.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
