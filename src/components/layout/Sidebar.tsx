"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  BookMarked,
  Star,
  CreditCard,
  HeartPulse,
  Truck,
  Store,
  LogOut,
  Menu,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useClerk, useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface AppSection {
  label: string;
  icon: React.ReactNode;
  items: NavItem[];
}

const appSections: AppSection[] = [
  {
    label: "Seller App",
    icon: <Store size={16} />,
    items: [
      { label: "Dashboard", href: "/dashboard/seller", icon: <LayoutDashboard size={16} /> },
      { label: "Purchases", href: "/dashboard/seller/purchases", icon: <CreditCard size={16} /> },
      { label: "Orders", href: "/dashboard/seller/orders", icon: <ShoppingCart size={16} /> },
      { label: "Products", href: "/dashboard/seller/products", icon: <Package size={16} /> },
      { label: "Users", href: "/dashboard/seller/users", icon: <Users size={16} /> },
      { label: "Reservations", href: "/dashboard/seller/reservations", icon: <BookMarked size={16} /> },
      { label: "Reviews", href: "/dashboard/seller/reviews", icon: <Star size={16} /> },
      { label: "Health", href: "/dashboard/seller/health", icon: <HeartPulse size={16} /> },
    ],
  },
  {
    label: "Payments App",
    icon: <CreditCard size={16} />,
    items: [
      { label: "Overview", href: "/dashboard/payments", icon: <CreditCard size={16} /> },
    ],
  },
  {
    label: "Buyer App",
    icon: <Users size={16} />,
    items: [
      { label: "Overview", href: "/dashboard/buyer", icon: <Store size={16} /> },
    ],
  },
  {
    label: "Shipping App",
    icon: <Truck size={16} />,
    items: [
      { label: "Overview", href: "/dashboard/shipping", icon: <Truck size={16} /> },
    ],
  },
];

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const { user } = useUser();
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    appSections.forEach((s) => {
      initial[s.label] = s.items.some((item) => pathname.startsWith(item.href));
    });
    if (!Object.values(initial).some(Boolean)) initial["Seller App"] = true;
    return initial;
  });

  const isActive = (href: string) => {
    if (href === "/dashboard/seller") return pathname === "/dashboard/seller";
    return pathname.startsWith(href);
  };

  const toggleSection = (label: string) => {
    setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const sidebarContent = (
    <div className="h-full flex flex-col bg-white">
      <div className="px-6 py-7 border-b border-[var(--color-border)]">
        <Link href="/dashboard" className="flex items-center gap-2.5 no-underline">
          <div className="w-8 h-8 bg-[var(--color-primary)] text-white flex items-center justify-center font-serif text-sm">
            B
          </div>
          <span className="font-serif text-xl text-[var(--color-primary)] tracking-tight">Control Plane</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        <nav>
          <Link
            href="/dashboard"
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 text-[0.75rem] uppercase tracking-[0.1em] font-semibold transition-all duration-200 no-underline",
              pathname === "/dashboard"
                ? "text-[var(--color-primary)] bg-[rgba(27,61,47,0.05)] border-l-3 border-[var(--color-primary)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
            )}
          >
            <LayoutDashboard size={16} />
            All Apps
          </Link>
        </nav>

        {appSections.map((section) => (
          <nav key={section.label}>
            <button
              onClick={() => toggleSection(section.label)}
              className="w-full flex items-center justify-between px-2 mb-2 text-[0.65rem] uppercase tracking-[0.2em] text-[#aaa] font-semibold cursor-pointer hover:text-[var(--color-primary)] transition-colors"
            >
              <span className="flex items-center gap-2">
                {section.icon}
                {section.label}
              </span>
              {expanded[section.label] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </button>
            {expanded[section.label] && (
              <ul className="space-y-0.5">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 text-[0.75rem] uppercase tracking-[0.1em] font-semibold transition-all duration-200 no-underline",
                        isActive(item.href)
                          ? "text-[var(--color-primary)] bg-[rgba(27,61,47,0.05)] border-l-3 border-[var(--color-primary)]"
                          : "text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
                      )}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </nav>
        ))}
      </div>

      <div className="px-4 py-5 border-t border-[var(--color-border)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-[var(--color-primary)] text-white flex items-center justify-center font-serif text-sm shrink-0">
            {user?.firstName?.charAt(0) || "A"}
          </div>
          <div className="min-w-0">
            <div className="font-serif text-sm text-[var(--color-primary)] truncate">{user?.fullName || "Admin"}</div>
            <div className="text-[0.65rem] text-[var(--color-text-muted)] truncate">{user?.primaryEmailAddress?.emailAddress || "Control Plane"}</div>
          </div>
        </div>
        <button onClick={() => signOut({ redirectUrl: "/login" })}
          className="w-full flex items-center justify-center gap-2 text-[0.7rem] uppercase tracking-[0.1em] font-semibold py-2.5 border border-[var(--color-border)] bg-transparent cursor-pointer transition-colors hover:bg-black hover:text-white"
        >
          <LogOut size={12} /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden lg:block w-[18rem] shrink-0">
        <div className="fixed top-0 left-0 w-[18rem] h-full z-30">{sidebarContent}</div>
      </div>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-[rgba(27,61,47,0.2)] backdrop-blur-sm lg:hidden" onClick={onClose} />
          <div className="fixed inset-y-0 left-0 z-50 w-[18rem] lg:hidden">{sidebarContent}</div>
        </>
      )}
    </>
  );
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="lg:hidden p-2 text-[var(--color-primary)] cursor-pointer" aria-label="Toggle menu">
      <Menu size={20} />
    </button>
  );
}
