"use client";

import Link from "next/link";
import { Store, CreditCard, Users, Truck } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { cn } from "@/lib/utils";

const apps = [
  { name: "Seller App", desc: "Products, orders, users, reservations, reviews and system health.", href: "/dashboard/seller", icon: Store, color: "var(--color-primary)", status: "Connected" },
  { name: "Payments App", desc: "Payment processing, refunds and transaction history.", href: "/dashboard/payments", icon: CreditCard, color: "var(--color-accent)", status: "Pending" },
  { name: "Buyer App", desc: "Customer storefront, browsing and purchasing.", href: "/dashboard/buyer", icon: Users, color: "var(--color-secondary)", status: "Pending" },
  { name: "Shipping App", desc: "Shipping dispatch, tracking and delivery.", href: "/dashboard/shipping", icon: Truck, color: "var(--color-warning)", status: "Pending" },
];

export default function DashboardHome() {
  return (
    <div>
      <PageHeader title="Control" italic="Plane" description="Centralized management for the Bonzai ecosystem." />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {apps.map((app) => (
          <Link key={app.name} href={app.href}
            className="no-underline border border-[var(--color-border)] bg-[var(--color-bg)] p-6 flex items-start gap-5 transition-all duration-200 hover:border-[var(--color-primary)] group"
          >
            <div className="w-12 h-12 flex items-center justify-center shrink-0" style={{ background: "rgba(27,61,47,0.05)", color: app.color }}>
              <app.icon size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-serif text-lg text-[var(--color-primary)]">{app.name}</span>
                <span className={cn("text-[0.55rem] uppercase tracking-[0.1em] font-semibold px-2 py-0.5 border",
                  app.status === "Connected"
                    ? "text-[var(--color-success)] bg-[rgba(22,163,74,0.05)] border-[rgba(22,163,74,0.2)]"
                    : "text-[var(--color-warning)] bg-[rgba(139,115,85,0.05)] border-[rgba(139,115,85,0.2)]"
                )}>
                  {app.status}
                </span>
              </div>
              <p className="text-sm text-[var(--color-text-muted)] mt-2">{app.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
