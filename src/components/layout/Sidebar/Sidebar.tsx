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
import styles from "./Sidebar.module.css";

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

  const allAppsClasses = [
    styles.allAppsLink,
    pathname === "/dashboard" ? styles.allAppsLinkActive : styles.allAppsLinkInactive,
  ].filter(Boolean).join(" ");

  const sidebarContent = (
    <div className={styles.sidebar}>
      <div className={styles.logo}>
        <Link href="/dashboard" className={styles.logoLink}>
          <div className={styles.logoIcon}>B</div>
          <span className={styles.logoText}>Control Plane</span>
        </Link>
      </div>

      <div className={styles.nav}>
        <nav>
          <Link
            href="/dashboard"
            onClick={onClose}
            className={allAppsClasses}
          >
            <LayoutDashboard size={16} />
            All Apps
          </Link>
        </nav>

        {appSections.map((section) => (
          <nav key={section.label}>
            <button
              onClick={() => toggleSection(section.label)}
              className={styles.sectionButton}
            >
              <span className={styles.sectionLabel}>
                {section.icon}
                {section.label}
              </span>
              {expanded[section.label] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </button>
            {expanded[section.label] && (
              <ul className={styles.itemList}>
                {section.items.map((item) => {
                  const linkClasses = [
                    styles.navLink,
                    isActive(item.href) ? styles.navLinkActive : styles.navLinkInactive,
                  ].filter(Boolean).join(" ");

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={linkClasses}
                      >
                        {item.icon}
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </nav>
        ))}
      </div>

      <div className={styles.footer}>
        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>
            {user?.firstName?.charAt(0) || "A"}
          </div>
          <div>
            <div className={styles.userName}>{user?.fullName || "Admin"}</div>
            <div className={styles.userEmail}>{user?.primaryEmailAddress?.emailAddress || "Control Plane"}</div>
          </div>
        </div>
        <button onClick={() => signOut({ redirectUrl: "/login" })}
          className={styles.logoutButton}
        >
          <LogOut size={12} /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className={styles.desktopSidebar}>
        <div className={styles.desktopFixed}>{sidebarContent}</div>
      </div>
      {isOpen && (
        <>
          <div className={styles.mobileOverlay} onClick={onClose} />
          <div className={styles.mobileSidebar}>{sidebarContent}</div>
        </>
      )}
    </>
  );
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className={styles.mobileMenuButton} aria-label="Toggle menu">
      <Menu size={20} />
    </button>
  );
}
