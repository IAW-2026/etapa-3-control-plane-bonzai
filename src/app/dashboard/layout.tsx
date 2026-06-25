"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar, MobileMenuButton } from "@/components/layout/Sidebar/Sidebar";
import { useAuth } from "@/lib/auth";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import styles from "./layout.module.css";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAdmin, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isAdmin) {
      router.push("/login");
    }
  }, [isAdmin, isLoaded, router]);

  if (!isLoaded || !isAdmin) {
    return (
      <div className={styles.loading}>
        <Spinner />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.mobileMenu}>
        <MobileMenuButton onClick={() => setSidebarOpen(true)} />
      </div>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className={styles.main}>
        <div className={styles.inner}>{children}</div>
      </main>
    </div>
  );
}
